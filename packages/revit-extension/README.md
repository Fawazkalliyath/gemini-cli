# Revit AI Extension for Gemini CLI

A powerful AI-powered extension that bridges Gemini CLI with Autodesk Revit,
enabling natural language control of Revit through AI assistance.

## Overview

The Revit AI Extension transforms how you interact with Autodesk Revit by
allowing you to:

- **Use Natural Language**: Describe what you want to do in plain English
- **AI-Powered Understanding**: Gemini AI interprets your intent and executes
  appropriate Revit commands
- **Smart Confirmation**: Complex operations require confirmation with detailed
  previews
- **Seamless Integration**: Works directly with your active Revit project

## Features

### Core Capabilities

- **Element Querying**: Search and retrieve elements by category, family, level,
  or other properties
- **Element Creation**: Create walls, doors, windows, and other building
  elements
- **Element Modification**: Update parameters and properties of existing
  elements
- **Element Deletion**: Remove elements with safety confirmations
- **Project Information**: Access project metadata and settings
- **Connection Management**: Monitor Revit connection status in real-time

### AI-Driven Features

- **Context-Aware Suggestions**: AI provides relevant recommendations based on
  your project
- **Natural Language Commands**: Speak to your BIM model naturally
- **Smart Validation**: AI helps validate commands before execution
- **Error Recovery**: Helpful error messages with suggested solutions

## Installation

### Prerequisites

- Node.js 20 or higher
- Gemini CLI installed
- Autodesk Revit (2020 or later)
- Revit add-in (instructions below)

### Step 1: Install the Extension

```bash
# Install via npm (when published)
npm install -g @google/gemini-cli-revit-extension

# Or install from source
cd packages/revit-extension
npm install
npm run build
```

### Step 2: Install Revit Add-in

The Revit Add-in enables communication between Gemini CLI and Revit:

1. Download the Revit Add-in from the releases page
2. Copy the add-in DLL to your Revit add-ins folder:
   - Default location: `%APPDATA%\Autodesk\Revit\Addins\[VERSION]\`
3. Restart Revit
4. The add-in should appear in the Revit ribbon

### Step 3: Configure Gemini CLI

Add the extension to your Gemini CLI configuration:

```json
{
  "mcpServers": {
    "revit": {
      "command": "node",
      "args": ["/path/to/gemini-cli-revit-extension/dist/index.js"],
      "cwd": "/path/to/gemini-cli-revit-extension"
    }
  }
}
```

## Usage

### Basic Commands

#### Query Elements

```
gemini: "Show me all walls in the project"
gemini: "List all doors on Level 1"
gemini: "Find windows in the main building"
```

#### Create Elements

```
gemini: "Create a wall from (0,0,0) to (10,0,0) on Level 1"
gemini: "Add a door in the center of the selected wall"
gemini: "Place a window at coordinates (5,3,2)"
```

#### Modify Elements

```
gemini: "Change the height of wall ID 12345 to 4 meters"
gemini: "Update the material of all exterior walls to concrete"
gemini: "Set the fire rating parameter of this door to 90 minutes"
```

#### Get Project Information

```
gemini: "What's the project name?"
gemini: "Show me project details"
gemini: "Who is the project author?"
```

### Advanced Usage

#### Natural Language Workflows

The AI assistant can handle complex multi-step tasks:

```
gemini: "I need to create a standard office layout with walls,
doors, and windows. The room should be 4x5 meters with one door
and two windows."
```

The AI will:

1. Understand the requirements
2. Ask for clarification if needed
3. Show a preview of what will be created
4. Request confirmation
5. Execute the commands in sequence

#### Confirmation Workflow

For destructive operations, the extension requires confirmation:

```
gemini: "Delete wall ID 12345"

AI Response:
{
  "type": "confirmation_required",
  "action": "delete_element",
  "details": {
    "elementId": "12345",
    "element": {
      "name": "Basic Wall: Exterior - Brick",
      "category": "Walls"
    }
  },
  "message": "Please confirm: Delete element 'Basic Wall: Exterior - Brick'?
              This action cannot be undone."
}

gemini: "Yes, proceed"
```

## API Reference

### Tools

#### `get_elements`

Query elements from the active Revit project.

**Input:**

```typescript
{
  category?: 'Walls' | 'Doors' | 'Windows' | ...,
  family?: string,
  level?: string,
  limit?: number (1-1000, default: 100)
}
```

**Output:**

```typescript
{
  success: boolean,
  count: number,
  elements: RevitElement[]
}
```

#### `create_element`

Create a new element in Revit.

**Input:**

```typescript
{
  category: RevitElementCategory,
  family: string,
  type: string,
  location: { x: number, y: number, z: number },
  parameters?: RevitParameter[],
  level?: string,
  confirmationRequired?: boolean (default: true)
}
```

#### `modify_element`

Modify an existing element's parameters.

**Input:**

```typescript
{
  elementId: string,
  parameters: RevitParameter[],
  confirmationRequired?: boolean (default: true)
}
```

#### `delete_element`

Delete an element from Revit.

**Input:**

```typescript
{
  elementId: string,
  confirmationRequired?: boolean (default: true)
}
```

#### `get_project_info`

Get information about the current project.

**Output:**

```typescript
{
  name: string,
  author?: string,
  buildingName?: string,
  clientName?: string,
  projectNumber?: string,
  projectAddress?: string,
  issueDate?: string
}
```

#### `get_connection_status`

Check connection status with Revit.

**Output:**

```typescript
{
  connected: boolean,
  revitVersion?: string,
  projectLoaded: boolean,
  projectName?: string
}
```

## Architecture

### Components

1. **MCP Server** (`index.ts`): The main entry point that registers tools and
   handles Gemini CLI communication
2. **Revit Bridge** (`revit-bridge.ts`): Manages WebSocket connection to Revit
   add-in
3. **Type Definitions** (`types.ts`): TypeScript interfaces for type safety

### Communication Flow

```
Gemini CLI <-> MCP Server <-> WebSocket Bridge <-> Revit Add-in <-> Revit API
```

1. User gives natural language command to Gemini CLI
2. Gemini AI interprets the command and calls appropriate MCP tool
3. MCP server sends command to Revit Bridge via WebSocket
4. Revit Add-in executes command using Revit API
5. Results flow back through the chain to the user

## Troubleshooting

### Connection Issues

**Problem:** "Not connected to Revit"

**Solutions:**

- Ensure Revit is running
- Check that the Revit add-in is loaded (look in Revit ribbon)
- Verify the add-in is not blocked (Windows may block DLLs from the internet)
- Check firewall settings allow WebSocket connection on port 8080

### Add-in Not Loading

**Problem:** Revit add-in doesn't appear in ribbon

**Solutions:**

- Check add-in is in correct folder:
  `%APPDATA%\Autodesk\Revit\Addins\[VERSION]\`
- Verify the `.addin` manifest file is present
- Check Windows Event Viewer for Revit add-in errors
- Ensure .NET Framework 4.8 or later is installed

### Command Failures

**Problem:** Commands fail with errors

**Solutions:**

- Check element IDs are valid
- Ensure required parameters are provided
- Verify families and types exist in the project
- Check transaction is not already open in Revit

## Development

### Building from Source

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Type check
npm run typecheck

# Lint
npm run lint
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:ci

# Watch mode (for development)
npm test -- --watch
```

## Contributing

Contributions are welcome! Please read the
[Contributing Guide](../../CONTRIBUTING.md) for details.

## License

Copyright 2025 Google LLC

Licensed under the Apache License, Version 2.0. See [LICENSE](../../LICENSE) for
details.

## Support

- **Issues**: Report bugs on
  [GitHub Issues](https://github.com/google-gemini/gemini-cli/issues)
- **Discussions**: Join the community discussions
- **Documentation**: Full docs at [geminicli.com](https://geminicli.com)

## Roadmap

### Planned Features

- [ ] Support for more element types (stairs, railings, ceilings)
- [ ] Advanced filtering and bulk operations
- [ ] Integration with Revit schedules
- [ ] Support for families and types management
- [ ] View creation and manipulation
- [ ] Sheet generation and management
- [ ] Parameter extraction and reporting
- [ ] Collaboration features (worksharing)
- [ ] Integration with other Autodesk products
- [ ] Visual feedback in Revit UI
- [ ] Undo/redo support
- [ ] Batch processing capabilities

## Acknowledgments

- Built on the Model Context Protocol (MCP)
- Powered by Google Gemini AI
- Integrates with Autodesk Revit API
