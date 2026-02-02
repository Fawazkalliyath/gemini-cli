# Revit Extension Examples

This document provides practical examples of using the Revit AI Extension with
Gemini CLI.

## Basic Examples

### 1. Querying Elements

#### Get all walls in the project

```bash
gemini chat

> Show me all the walls in the project

AI will use the get_elements tool:
{
  "category": "Walls",
  "limit": 100
}

Response: Lists all walls with their IDs, names, and properties
```

#### Filter by level

```bash
> Find all doors on Level 2

AI will query:
{
  "category": "Doors",
  "level": "Level 2"
}
```

#### Search by family

```bash
> List all windows from the "Fixed" family

AI will query:
{
  "category": "Windows",
  "family": "Fixed"
}
```

### 2. Creating Elements

#### Create a simple wall

```bash
> Create a wall from point (0,0,0) to (20,0,0) on Level 1 using Basic Wall type

AI will:
1. Parse the intent
2. Show what will be created
3. Request confirmation
4. Execute the create_element tool
```

#### Create multiple elements

```bash
> I need to create a rectangular room that is 15 feet by 20 feet on Level 1 with
> walls 10 feet high, one door on the south wall, and two windows on the north wall

AI will:
1. Break down into steps
2. Calculate positions
3. Create walls
4. Add door
5. Add windows
6. Confirm completion
```

### 3. Modifying Elements

#### Change wall height

```bash
> Change the height of wall ID 123456 to 12 feet

AI will:
1. Get current wall properties
2. Show proposed changes
3. Request confirmation
4. Update the parameter
```

#### Update multiple parameters

```bash
> For wall 123456, set the fire rating to 2 hours and add a comment
> "Fire barrier per code requirement"

AI will modify multiple parameters at once
```

### 4. Project Information

#### Get project details

```bash
> What project am I working on?

AI uses get_project_info to show:
- Project name
- Author
- Building name
- Client
- Project number
- Address
```

### 5. Connection Management

#### Check connection status

```bash
> Is Revit connected?

AI uses get_connection_status to report:
- Connection status
- Revit version
- Active project
```

## Advanced Examples

### Complex Workflows

#### Office Layout Creation

```bash
> Create a standard office layout:
> - Rectangular space 12 feet by 15 feet
> - Located on Level 2 at coordinates starting from (100, 100, 0)
> - Exterior walls on all sides using "Exterior - Brick" type
> - One 3-foot door centered on the west wall
> - Two 4-foot windows on the east wall
> - Interior finish: painted gypsum

AI will:
1. Confirm understanding of requirements
2. Calculate all positions
3. Show a preview of the layout
4. Create walls sequentially
5. Add door and windows
6. Report success with element IDs
```

#### Batch Operations

```bash
> Find all walls on Level 1 that are less than 10 feet high and
> increase their height to 12 feet

AI will:
1. Query walls on Level 1
2. Filter by height < 10 feet
3. Show count and list of affected walls
4. Request confirmation
5. Modify each wall
6. Report results
```

### Natural Language Queries

#### Spatial Understanding

```bash
> Show me all doors near the main entrance

AI interprets "near the main entrance" by:
1. Identifying main entrance location
2. Querying doors within proximity
3. Presenting results with distances
```

#### Contextual Recommendations

```bash
> I need to add fire-rated walls around the stairwell

AI will:
1. Ask for stairwell location if not specified
2. Recommend appropriate wall types
3. Suggest wall placement
4. Create walls with fire rating parameters
```

## Integration Examples

### Using Prompts

#### AI Assistant for Complex Tasks

```bash
gemini prompt revit-assistant \
  --task "Design an efficient HVAC layout for a 3-story office building" \
  --context "Each floor is 10,000 sq ft, mechanical room on ground floor"

AI provides:
1. System recommendations
2. Equipment sizing
3. Duct routing suggestions
4. Step-by-step implementation plan
```

### Scripting Examples

#### Automate with Scripts

```javascript
// Example: Create a grid of columns
for (let x = 0; x < 100; x += 20) {
  for (let y = 0; y < 100; y += 20) {
    console.log(`Create column at (${x}, ${y}, 0) on Level 1`);
    // Gemini CLI will process each command
  }
}
```

## Error Handling Examples

### Graceful Failures

#### Element Not Found

```bash
> Modify wall ID 999999

AI Response:
"I couldn't find a wall with ID 999999. This might be because:
1. The element was deleted
2. The ID is from a different project
3. You meant a different element

Would you like me to:
- Search for walls by other criteria?
- Show recent walls you've worked with?"
```

#### Invalid Operation

```bash
> Create a wall with negative dimensions

AI Response:
"I can't create a wall with negative dimensions.
Let me help you specify valid dimensions.
What are the intended start and end points?"
```

## Best Practices

### Confirmation Workflow

Always confirm before destructive operations:

```bash
> Delete wall 123456

AI: "Please confirm: Delete wall 'Basic Wall: Exterior - Brick'?
     This action cannot be undone.
     Current properties:
     - Category: Walls
     - Level: Level 1
     - Length: 20 feet

     Type 'yes' to proceed or 'no' to cancel."
```

### Incremental Changes

Test changes on a single element first:

```bash
> Update the material of wall 123456 to concrete
> [Verify the result]
> Now update all walls on Level 1 to concrete
```

### Save Before Major Operations

```bash
> Before I create 50 new elements, did you save the project?

AI: "I can't save the project directly, but I recommend:
     1. Save your work in Revit
     2. Consider creating a backup
     3. Then proceed with bulk operations"
```

## Troubleshooting Examples

### Connection Issues

```bash
> I can't connect to Revit

AI checks:
1. Is Revit running?
2. Is the add-in loaded?
3. Is the WebSocket port available?
4. Are there firewall issues?

Provides specific solutions based on the issue
```

### Performance Issues

```bash
> Queries are very slow

AI suggests:
1. Reduce query limits
2. Add more specific filters
3. Close unused views in Revit
4. Check project file size
```

## Integration with Other Tools

### Export to Other Formats

```bash
> Get all door specifications and create a schedule

AI will:
1. Query all doors
2. Extract parameters
3. Format as table
4. Provide exportable data
```

### Coordination Workflows

```bash
> Compare this project with the structural model

AI helps:
1. Identify clash points
2. Suggest resolutions
3. Update elements as needed
```

## Tips and Tricks

### Efficient Querying

- Use specific filters to reduce data transfer
- Limit results to what you need
- Combine related queries

### Smart Confirmations

- Provide context in your requests
- Review previews carefully
- Use incremental testing

### Natural Language

- Be conversational, not technical
- Provide context when needed
- Ask for clarification if unsure

## Next Steps

- Review [README.md](README.md) for API details
- Check [GEMINI.md](GEMINI.md) for AI behavior
- See [REVIT_ADDIN_GUIDE.md](REVIT_ADDIN_GUIDE.md) for C# implementation

## Support

For more examples or help:

- GitHub Issues
- Community Forums
- Documentation at geminicli.com
