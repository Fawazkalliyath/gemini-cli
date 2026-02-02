# Revit AI Extension

The Revit AI Extension enables natural language control of Autodesk Revit
through Gemini CLI. Use AI to query, create, modify, and manage Revit elements
with simple text commands.

## Overview

This extension bridges Gemini CLI with Autodesk Revit, allowing you to:

- **Query elements** by category, family, or level
- **Create elements** like walls, doors, and windows
- **Modify parameters** of existing elements
- **Delete elements** with safety confirmations
- **Access project information** and metadata
- **Use natural language** for complex BIM tasks

## Installation

### Prerequisites

- Node.js 20 or higher
- Gemini CLI installed
- Autodesk Revit (2020 or later)
- Revit add-in (required for communication)

### Quick Start

1. The extension is included as a workspace package in the Gemini CLI repository
2. Build the extension:

```bash
npm run build --workspace @google/gemini-cli-revit-extension
```

3. Configure in your Gemini CLI settings:

```json
{
  "mcpServers": {
    "revit": {
      "command": "node",
      "args": ["packages/revit-extension/dist/index.js"],
      "env": {
        "REVIT_BRIDGE_PORT": "8080"
      }
    }
  }
}
```

4. Install the Revit Add-in (see
   [REVIT_ADDIN_GUIDE.md](../../packages/revit-extension/REVIT_ADDIN_GUIDE.md))

## Usage Examples

### Basic Queries

```bash
gemini chat

You: Show me all walls in the project
AI: [Queries and displays wall information]

You: List doors on Level 1
AI: [Filters and shows doors on Level 1]
```

### Creating Elements

```bash
You: Create a wall from (0,0,0) to (10,0,0) on Level 1
AI: [Shows preview and requests confirmation]
AI: Element created successfully
```

### Natural Language Tasks

```bash
You: I need to create an office layout with 4 walls forming a rectangle,
     one door on the south wall, and two windows on the north wall
AI: [Breaks down the task, confirms understanding, and executes]
```

## Features

### MCP Tools

- `get_elements` - Query elements by various criteria
- `create_element` - Create new building elements
- `modify_element` - Update element parameters
- `delete_element` - Remove elements with confirmation
- `get_project_info` - Access project metadata
- `get_connection_status` - Check Revit connection

### AI Assistant

The `revit-assistant` prompt provides context-aware help:

```bash
gemini prompt revit-assistant \
  --task "create structural columns" \
  --context "5-story building, steel frame"
```

### Smart Confirmations

Destructive operations require confirmation:

```
You: Delete wall ID 12345
AI: Please confirm: Delete element "Basic Wall: Exterior - Brick"?
    This action cannot be undone.
You: Yes, proceed
AI: Element deleted successfully
```

## Architecture

```
User ↔ Gemini CLI ↔ MCP Server ↔ WebSocket Bridge ↔ Revit Add-in ↔ Revit API
```

The extension uses:

- **MCP Server**: Registers tools and handles Gemini communication
- **WebSocket Bridge**: Maintains connection with Revit
- **Type Validation**: Zod schemas ensure data integrity
- **Error Handling**: User-friendly error messages

## Configuration

### Environment Variables

- `REVIT_BRIDGE_PORT` - WebSocket port (default: 8080)

### Extension Settings

Add to your `gemini-extension.json`:

```json
{
  "name": "revit-ai-extension",
  "version": "1.0.0",
  "mcpServers": {
    "revit": {
      "command": "node",
      "args": ["${extensionPath}/dist/index.js"],
      "env": {
        "REVIT_BRIDGE_PORT": "8080"
      }
    }
  }
}
```

## Troubleshooting

### Connection Issues

**Problem**: "Not connected to Revit"

**Solutions**:

- Ensure Revit is running
- Verify Revit add-in is loaded
- Check WebSocket port is not blocked
- Restart both Revit and Gemini CLI

### Performance

**Issue**: Slow response times

**Solutions**:

- Reduce query limits
- Filter queries more specifically
- Check network latency
- Optimize Revit project size

### Add-in Not Loading

See [REVIT_ADDIN_GUIDE.md](../../packages/revit-extension/REVIT_ADDIN_GUIDE.md)
for detailed troubleshooting.

## Development

### Building

```bash
cd packages/revit-extension
npm install
npm run build
```

### Testing

```bash
npm test              # Run all tests
npm run typecheck     # Type checking
npm run lint          # Lint code
```

### Project Structure

```
packages/revit-extension/
├── src/
│   ├── index.ts           # MCP server entry point
│   ├── revit-bridge.ts    # WebSocket communication
│   ├── types.ts           # Type definitions
│   └── *.test.ts          # Tests
├── dist/                  # Build output
├── README.md             # Detailed documentation
├── GEMINI.md            # AI context and guidelines
└── REVIT_ADDIN_GUIDE.md # C# add-in implementation
```

## API Reference

See the [README](../../packages/revit-extension/README.md) for complete API
documentation.

## Contributing

Contributions are welcome! Areas for improvement:

- Additional element types support
- Advanced filtering options
- Schedule integration
- Family management
- View and sheet operations
- Performance optimizations

## Resources

- [Package README](../../packages/revit-extension/README.md)
- [AI Context Guide](../../packages/revit-extension/GEMINI.md)
- [Revit Add-in Guide](../../packages/revit-extension/REVIT_ADDIN_GUIDE.md)
- [Revit API Documentation](https://www.revitapidocs.com/)

## License

Apache License 2.0 - See [LICENSE](../../LICENSE) for details.
