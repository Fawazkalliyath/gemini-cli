# Revit Add-in Development Guide

This document provides guidance for creating a Revit add-in that works with the
Gemini CLI Revit Extension.

## Overview

The Revit add-in acts as a bridge between Revit and the Gemini CLI MCP server.
It:

- Opens a WebSocket server to listen for commands
- Executes Revit API calls based on received commands
- Returns results back to the MCP server

## Architecture

```
Gemini CLI → MCP Server → WebSocket → Revit Add-in → Revit API
```

## Requirements

- Visual Studio 2019 or later
- .NET Framework 4.8 or later
- Revit 2020 or later
- Revit API references

## Sample C# Implementation

### 1. Add-in Manifest (.addin file)

```xml
<?xml version="1.0" encoding="utf-8"?>
<RevitAddIns>
  <AddIn Type="Application">
    <Name>Gemini CLI Bridge</Name>
    <Assembly>GeminiRevitBridge.dll</Assembly>
    <AddInId>12345678-1234-1234-1234-123456789ABC</AddInId>
    <FullClassName>GeminiRevitBridge.Application</FullClassName>
    <VendorId>GMNI</VendorId>
    <VendorDescription>Gemini CLI</VendorDescription>
  </AddIn>
</RevitAddIns>
```

### 2. Main Application Class

```csharp
using System;
using Autodesk.Revit.UI;
using Autodesk.Revit.DB;

namespace GeminiRevitBridge
{
    public class Application : IExternalApplication
    {
        private WebSocketServer _server;

        public Result OnStartup(UIControlledApplication application)
        {
            try
            {
                // Start WebSocket server
                _server = new WebSocketServer(8080);
                _server.Start();

                // Create ribbon panel
                RibbonPanel panel = application.CreateRibbonPanel("Gemini CLI");

                // Add button
                PushButtonData buttonData = new PushButtonData(
                    "GeminiConnect",
                    "Connect",
                    typeof(Application).Assembly.Location,
                    "GeminiRevitBridge.ConnectCommand"
                );

                panel.AddItem(buttonData);

                TaskDialog.Show("Gemini CLI Bridge",
                    "Gemini CLI Bridge started successfully");

                return Result.Succeeded;
            }
            catch (Exception ex)
            {
                TaskDialog.Show("Error", ex.Message);
                return Result.Failed;
            }
        }

        public Result OnShutdown(UIControlledApplication application)
        {
            _server?.Stop();
            return Result.Succeeded;
        }
    }
}
```

### 3. WebSocket Server

```csharp
using System;
using System.Net;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace GeminiRevitBridge
{
    public class WebSocketServer
    {
        private readonly int _port;
        private HttpListener _httpListener;
        private CancellationTokenSource _cancellationToken;

        public WebSocketServer(int port)
        {
            _port = port;
        }

        public void Start()
        {
            _cancellationToken = new CancellationTokenSource();
            _httpListener = new HttpListener();
            _httpListener.Prefixes.Add($"http://localhost:{_port}/");
            _httpListener.Start();

            Task.Run(async () => await ListenAsync());
        }

        private async Task ListenAsync()
        {
            while (!_cancellationToken.Token.IsCancellationRequested)
            {
                try
                {
                    var context = await _httpListener.GetContextAsync();

                    if (context.Request.IsWebSocketRequest)
                    {
                        var wsContext = await context.AcceptWebSocketAsync(null);
                        _ = HandleWebSocketAsync(wsContext.WebSocket);
                    }
                    else
                    {
                        context.Response.StatusCode = 400;
                        context.Response.Close();
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error: {ex.Message}");
                }
            }
        }

        private async Task HandleWebSocketAsync(WebSocket webSocket)
        {
            var buffer = new byte[4096];

            while (webSocket.State == WebSocketState.Open)
            {
                try
                {
                    var result = await webSocket.ReceiveAsync(
                        new ArraySegment<byte>(buffer),
                        CancellationToken.None
                    );

                    if (result.MessageType == WebSocketMessageType.Text)
                    {
                        var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                        var response = await ProcessMessageAsync(message);

                        var responseBytes = Encoding.UTF8.GetBytes(response);
                        await webSocket.SendAsync(
                            new ArraySegment<byte>(responseBytes),
                            WebSocketMessageType.Text,
                            true,
                            CancellationToken.None
                        );
                    }
                    else if (result.MessageType == WebSocketMessageType.Close)
                    {
                        await webSocket.CloseAsync(
                            WebSocketCloseStatus.NormalClosure,
                            "Closing",
                            CancellationToken.None
                        );
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error handling message: {ex.Message}");
                    break;
                }
            }
        }

        private async Task<string> ProcessMessageAsync(string message)
        {
            try
            {
                var command = JsonConvert.DeserializeObject<RevitCommand>(message);
                var handler = new CommandHandler();
                var result = await handler.ExecuteAsync(command);

                return JsonConvert.SerializeObject(new
                {
                    type = "response",
                    id = command.Id,
                    data = result,
                    timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
                });
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new
                {
                    type = "error",
                    data = new { message = ex.Message },
                    timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
                });
            }
        }

        public void Stop()
        {
            _cancellationToken?.Cancel();
            _httpListener?.Stop();
        }
    }
}
```

### 4. Command Handler

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Autodesk.Revit.DB;
using Autodesk.Revit.UI;

namespace GeminiRevitBridge
{
    public class CommandHandler
    {
        private readonly UIApplication _uiApp;
        private readonly Document _doc;

        public CommandHandler()
        {
            _uiApp = RevitContext.UIApplication;
            _doc = _uiApp.ActiveUIDocument?.Document;
        }

        public async Task<object> ExecuteAsync(RevitCommand command)
        {
            return command.Command switch
            {
                "get_elements" => await GetElementsAsync(command.Parameters),
                "get_element_by_id" => await GetElementByIdAsync(command.Parameters),
                "create_element" => await CreateElementAsync(command.Parameters),
                "modify_element" => await ModifyElementAsync(command.Parameters),
                "delete_element" => await DeleteElementAsync(command.Parameters),
                "get_project_info" => await GetProjectInfoAsync(),
                _ => throw new NotSupportedException($"Command not supported: {command.Command}")
            };
        }

        private async Task<object> GetElementsAsync(Dictionary<string, object> parameters)
        {
            var elements = new List<object>();

            using (Transaction trans = new Transaction(_doc, "Get Elements"))
            {
                trans.Start();

                var collector = new FilteredElementCollector(_doc);

                if (parameters.ContainsKey("category"))
                {
                    var categoryName = parameters["category"].ToString();
                    var category = GetCategoryByName(categoryName);
                    collector.OfCategory(category);
                }

                var limit = parameters.ContainsKey("limit")
                    ? Convert.ToInt32(parameters["limit"])
                    : 100;

                foreach (Element elem in collector.Take(limit))
                {
                    elements.Add(new
                    {
                        id = elem.Id.ToString(),
                        name = elem.Name,
                        category = elem.Category?.Name ?? "Unknown",
                        level = _doc.GetElement(elem.LevelId)?.Name
                    });
                }

                trans.Commit();
            }

            return elements;
        }

        private async Task<object> GetProjectInfoAsync()
        {
            var projectInfo = _doc.ProjectInformation;

            return new
            {
                name = projectInfo.Name,
                author = projectInfo.Author,
                buildingName = projectInfo.BuildingName,
                clientName = projectInfo.ClientName,
                projectNumber = projectInfo.Number,
                projectAddress = projectInfo.Address
            };
        }

        private BuiltInCategory GetCategoryByName(string categoryName)
        {
            return categoryName switch
            {
                "Walls" => BuiltInCategory.OST_Walls,
                "Doors" => BuiltInCategory.OST_Doors,
                "Windows" => BuiltInCategory.OST_Windows,
                "Floors" => BuiltInCategory.OST_Floors,
                "Roofs" => BuiltInCategory.OST_Roofs,
                _ => BuiltInCategory.OST_GenericModel
            };
        }
    }
}
```

### 5. Data Models

```csharp
using System.Collections.Generic;

namespace GeminiRevitBridge
{
    public class RevitCommand
    {
        public string Type { get; set; }
        public string Id { get; set; }
        public CommandData Data { get; set; }
        public long Timestamp { get; set; }
    }

    public class CommandData
    {
        public string Command { get; set; }
        public Dictionary<string, object> Parameters { get; set; }
    }
}
```

## Installation Steps

1. **Build the Add-in**:
   - Open the solution in Visual Studio
   - Add Revit API references from your Revit installation
   - Build the project

2. **Deploy**:
   - Copy the built DLL to: `%APPDATA%\Autodesk\Revit\Addins\[VERSION]\`
   - Copy the .addin manifest to the same location
   - Ensure all dependencies are included

3. **Test**:
   - Start Revit
   - Check that the add-in appears in the ribbon
   - Look for "Gemini CLI" panel

## NuGet Packages Required

```xml
<ItemGroup>
  <PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
</ItemGroup>
```

## Security Considerations

- Only accept connections from localhost
- Validate all incoming commands
- Use transactions for all Revit API operations
- Implement proper error handling
- Log all operations for debugging

## Error Handling

```csharp
try
{
    using (Transaction trans = new Transaction(_doc, "Operation"))
    {
        trans.Start();
        // Revit API operations
        trans.Commit();
    }
}
catch (Autodesk.Revit.Exceptions.OperationCanceledException)
{
    // User cancelled
    return new { success = false, error = "Operation cancelled" };
}
catch (Exception ex)
{
    return new { success = false, error = ex.Message };
}
```

## Testing

1. **Unit Tests**: Test command handlers independently
2. **Integration Tests**: Test with actual Revit API
3. **End-to-End Tests**: Test with Gemini CLI

## Debugging

- Enable Visual Studio debugger attachment to Revit
- Use Revit's debug mode
- Log messages to file for production debugging

## Resources

- [Revit API Documentation](https://www.revitapidocs.com/)
- [Revit Developer Network](https://www.autodesk.com/developer-network/platform-technologies/revit)
- [The Building Coder Blog](https://thebuildingcoder.typepad.com/)

## Support

For issues or questions:

- GitHub Issues
- Revit API Forums
- Gemini CLI Documentation
