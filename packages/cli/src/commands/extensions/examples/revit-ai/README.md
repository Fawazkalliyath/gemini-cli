# Revit AI Assistant Extension

An example Gemini CLI extension that demonstrates how to build an AI assistant for Autodesk Revit with natural language command processing.

## Overview

This extension provides a foundation for building a Revit AI assistant that can:
- Accept natural language commands (e.g., "create a wall", "add a door to the living room")
- Parse and understand user intent
- Confirm understanding when commands are ambiguous
- Provide recommendations and guidance
- Execute Revit tasks properly

## Features

### 🤖 Natural Language Processing
- Parses conversational commands into structured Revit operations
- Identifies parameters from natural language
- Provides confidence scoring

### ✅ Confirmation Workflow
- Always confirms understanding before execution
- Shows what was understood and any assumptions
- Provides recommendations when clarity is low

### 🔧 Revit Operations (Mock)
- Create elements (walls, doors, windows, rooms, etc.)
- Modify element properties
- Delete elements
- Query project information

### 📚 Context-Aware Assistance
- Understands Revit terminology and concepts
- Provides guidance on best practices
- Explains requirements and constraints

## Installation

### Prerequisites
- Node.js 20 or higher
- Gemini CLI installed

### Setup

1. Navigate to this directory:
   ```bash
   cd packages/cli/src/commands/extensions/examples/revit-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the TypeScript code:
   ```bash
   npm run build
   ```

4. Link the extension to Gemini CLI:
   ```bash
   gemini extensions link .
   ```

## Usage

### Starting a Session

```bash
gemini
```

The extension will automatically load and provide Revit-specific context.

### Example Commands

#### Simple Operations
```
User: Create a wall
Assistant: [parses command, shows understanding, asks for confirmation]

User: Add a door
Assistant: [requests clarification on type, location, and dimensions]
```

#### Complex Operations
```
User: Add a 900mm wide door to the north wall of the living room
Assistant: [shows full understanding, confirms parameters, provides recommendations]
```

#### Ambiguous Commands
```
User: Fix the thing in the corner
Assistant: [identifies low confidence, asks clarifying questions, provides examples]
```

### Using Tools Directly

You can also call the MCP tools directly:

```
parse_revit_command:
  command: "create a wall 3 meters high"

get_revit_project_info

execute_revit_command:
  operation: "create_wall"
  parameters: { height: "3000mm", type: "generic" }
  confirmed: true
```

## Architecture

```
┌─────────────────┐
│   Gemini CLI    │
│   with Gemini   │
│     AI Model    │
└────────┬────────┘
         │
         │ MCP Protocol
         │
┌────────▼────────┐
│  Revit MCP      │
│    Server       │
│  (This Extension)│
└────────┬────────┘
         │
         │ (Not Implemented)
         │ Communication Bridge
         │ (HTTP/IPC/WebSocket)
         │
┌────────▼────────┐
│  Revit Add-in   │
│  (.NET/C#)      │
│                 │
│  Uses Revit API │
└─────────────────┘
```

## Current Implementation Status

### ✅ Implemented
- MCP Server with tools for command parsing
- Natural language understanding (basic pattern matching)
- Confirmation workflow logic
- Revit context and terminology guidance
- Mock tool responses for demonstration

### ❌ Not Implemented (Required for Production)
- Actual Revit API integration
- Revit add-in (.NET component)
- Communication bridge between MCP server and Revit
- Real-time Revit project querying
- Actual command execution in Revit
- Transaction management and error handling

## Production Implementation Guide

To turn this into a production-ready Revit integration:

### 1. Create a Revit Add-in

Develop a .NET application using the Revit API:

```csharp
// Example Revit Add-in structure
public class RevitCommandHandler : IExternalApplication
{
    public Result OnStartup(UIControlledApplication application)
    {
        // Start HTTP server or IPC listener
        // Register command handlers
        // Set up communication with MCP server
    }
    
    public Result OnShutdown(UIControlledApplication application)
    {
        // Clean up resources
    }
}
```

### 2. Implement Communication Bridge

Choose a communication method:
- **HTTP REST API**: Simple, works across processes
- **gRPC**: Efficient, type-safe
- **Named Pipes**: Fast IPC on same machine
- **WebSocket**: Real-time bidirectional communication

### 3. Update MCP Server

Replace mock implementations with actual API calls:

```typescript
// Example: Real implementation
async ({ command }) => {
  const response = await fetch('http://localhost:8080/api/parse', {
    method: 'POST',
    body: JSON.stringify({ command }),
    headers: { 'Content-Type': 'application/json' }
  });
  return await response.json();
}
```

### 4. Handle Revit Transactions

Revit requires operations to be wrapped in transactions:

```csharp
using (Transaction trans = new Transaction(doc, "Create Wall"))
{
    trans.Start();
    // Create wall
    trans.Commit();
}
```

### 5. Error Handling

Implement robust error handling:
- Validate parameters before execution
- Handle Revit-specific exceptions
- Provide meaningful error messages
- Implement rollback on failure

## Development

### Building
```bash
npm run build
```

### Testing
The extension includes mock implementations that can be tested without Revit:
```bash
# In Gemini CLI
parse_revit_command { command: "create a wall" }
```

### Debugging
Enable debug mode in Gemini CLI to see detailed MCP communication:
```bash
DEBUG=1 gemini
```

## Limitations

This is an **example extension** for demonstration purposes:
- Does not actually connect to Revit
- Returns mock data for all operations
- Cannot execute real Revit commands
- Requires additional development for production use

## Resources

### Revit API
- [Revit API Documentation](https://www.revitapidocs.com/)
- [Revit SDK Samples](https://github.com/jeremytammik/RevitSdkSamples)
- [The Building Coder Blog](https://thebuildingcoder.typepad.com/)

### Gemini CLI
- [Gemini CLI Documentation](https://geminicli.com/docs/)
- [Extension Development Guide](../../../../../../docs/extensions/getting-started-extensions.md)
- [MCP Server Documentation](../../../../../../docs/tools/mcp-server.md)

### Model Context Protocol
- [MCP Specification](https://modelcontextprotocol.io/)
- [MCP SDK](https://github.com/modelcontextprotocol/sdk)

## Contributing

This is an example extension. If you want to extend it:
1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Submit a pull request with documentation

## License

Copyright 2025 Google LLC

Licensed under the Apache License, Version 2.0. See the LICENSE file at the repository root.

## Support

This is an example/demonstration extension. For:
- Gemini CLI issues: [GitHub Issues](https://github.com/google-gemini/gemini-cli/issues)
- Revit API questions: [Autodesk Forums](https://forums.autodesk.com/t5/revit-api-forum/bd-p/160)
- Extension development: [Gemini CLI Documentation](https://geminicli.com/docs/)
