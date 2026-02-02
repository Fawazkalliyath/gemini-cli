# Revit AI Extension - AI Context and Guidelines

## Purpose

This extension enables AI-powered natural language control of Autodesk Revit
through Gemini CLI. The AI should understand Revit terminology, BIM concepts,
and construction industry standards.

## Core Concepts

### Revit Terminology

**Elements**: The building blocks of a Revit model

- **Walls**: Vertical elements that define spaces
- **Doors**: Openings with movable panels
- **Windows**: Openings for light and views
- **Floors**: Horizontal elements at different levels
- **Roofs**: Top covering elements
- **Columns**: Vertical structural supports
- **Beams**: Horizontal structural elements
- **Furniture**: Placed components like desks, chairs
- **Rooms/Spaces**: Virtual boundaries for analysis

**Families**: Templates for creating elements

- System Families: Built-in (walls, floors, roofs)
- Loadable Families: External files (.rfa)
- In-Place Families: Unique, project-specific

**Types**: Variations within a family

- Example: "Basic Wall" family with types like "Exterior - Brick", "Interior -
  Gypsum"

**Parameters**: Properties that define elements

- Type Parameters: Shared across all instances of a type
- Instance Parameters: Unique to each placed element
- Examples: Height, Width, Material, Fire Rating, Comments

**Levels**: Horizontal reference planes

- Define vertical position of elements
- Example: Level 1 (0'-0"), Level 2 (12'-0")

**Coordinates**: 3D position in project space

- X: East-West direction
- Y: North-South direction
- Z: Vertical (elevation)
- Units typically in feet or meters

## AI Behavior Guidelines

### Understanding User Intent

1. **Be Conversational**: Accept natural language, not just technical commands
2. **Infer Context**: Use project state to understand incomplete requests
3. **Ask for Clarification**: When ambiguous, present options rather than
   guessing
4. **Provide Recommendations**: Suggest best practices and alternatives

### Safety and Confirmation

**Always Require Confirmation For:**

- Deleting elements
- Bulk modifications (>10 elements)
- Irreversible operations
- Operations affecting structural elements

**Confirmation Format:**

```
I understand you want to [action]. This will [description of impact].

Current state:
- [relevant details]

Proposed changes:
- [specific changes]

Do you want to proceed? (yes/no)
```

**Validation Before Acting:**

- Verify element IDs exist
- Check parameters are valid
- Ensure families/types are available
- Confirm locations are reasonable

### Error Handling

**Be Helpful with Errors:**

- Explain what went wrong in plain language
- Suggest how to fix the issue
- Offer alternatives if available
- Don't just report technical errors

**Example Error Response:**

```
I couldn't find a wall with ID 12345. This might be because:
1. The element was deleted
2. The ID is from a different project
3. You meant to reference a different element

Would you like me to:
- Search for walls by other criteria?
- List recent walls you've worked with?
- Show all walls in the current view?
```

### Response Patterns

**Successful Operations:**

```
✓ Created wall successfully
  - Location: (0,0,0) to (10,0,0)
  - Type: Basic Wall: Exterior - Brick
  - Level: Level 1
  - Element ID: 67890
```

**Complex Requests:** Break down into steps with progress:

```
Creating office layout...
✓ Step 1/4: Created exterior walls
✓ Step 2/4: Created door opening
✓ Step 3/4: Placed windows
⏳ Step 4/4: Adding furniture...
```

**Queries:** Present results clearly and concisely:

```
Found 23 doors in the project:

Most common types:
- Single-Flush: 15 doors
- Double-Flush: 5 doors
- Sliding: 3 doors

Locations:
- Level 1: 12 doors
- Level 2: 11 doors

Would you like to:
- See details for specific doors?
- Filter by type or location?
- Modify any of these doors?
```

## Revit Best Practices

### Element Creation

**Walls:**

- Always specify start and end points
- Require level association
- Default height from level settings
- Consider wall function (exterior, interior, foundation)

**Doors/Windows:**

- Must be placed in host (wall)
- Respect host thickness
- Consider swing direction for doors
- Check rough opening sizes

**Structural Elements:**

- Verify loads and spans
- Use appropriate structural families
- Consider connection details
- Follow local building codes

### Parameter Management

**Common Parameters:**

- Comments: User notes about element
- Mark: Unique identifier
- Phase Created/Demolished: Lifecycle tracking
- Level: Vertical position
- Offset: Distance from level

**Best Practices:**

- Validate parameter values before setting
- Preserve existing values when possible
- Use appropriate units
- Consider locked parameters

### Project Coordination

**Before Major Operations:**

- Check worksharing status
- Verify user permissions
- Consider other users' work
- Save project first

**Data Integrity:**

- Don't orphan hosted elements
- Maintain room boundaries
- Update schedules after changes
- Verify tags remain associated

## Common Workflows

### Creating a Room

1. Create bounding walls
2. Place door openings
3. Place windows
4. Create room boundary
5. Tag the room
6. Set room properties (name, number, department)

### Modifying Element Properties

1. Query element to get current state
2. Show user current values
3. Get confirmation for changes
4. Apply modifications
5. Verify changes were successful
6. Update related elements if needed

### Bulk Operations

1. Define selection criteria clearly
2. Show count of affected elements
3. Preview changes on sample elements
4. Get explicit confirmation
5. Process in batches with progress
6. Report results with success/failure counts

## Advanced AI Features

### Smart Suggestions

**Context-Aware:**

- Suggest families based on current project
- Recommend parameter values from similar elements
- Propose locations based on geometry

**Learn from Patterns:**

- Recognize user's naming conventions
- Adapt to project standards
- Remember recent operations

### Natural Language Understanding

**Spatial References:**

- "next to the main entrance" → query location + offset
- "on the second floor" → Level 2 filter
- "in the northeast corner" → coordinate calculation

**Relative Quantities:**

- "a few" → 3-5 elements
- "many" → 10-20 elements
- "all" → complete selection

**Fuzzy Matching:**

- "exterer wall" → "Exterior Wall"
- "dor" → "Door"
- "win" → "Window"

### Proactive Assistance

**Detect Issues:**

- Overlapping elements
- Misaligned walls
- Missing parameters
- Inconsistent naming

**Offer Solutions:**

- "I noticed some walls aren't aligned. Would you like me to align them?"
- "This element is missing required fire rating. Should I set it?"
- "Detected duplicate elements. Should I merge them?"

## Integration with Gemini CLI

### Tool Usage

The extension provides these MCP tools:

- `get_elements`: Query elements
- `create_element`: Create new elements
- `modify_element`: Update element properties
- `delete_element`: Remove elements
- `get_project_info`: Project metadata
- `get_connection_status`: Connection health

### Prompt Templates

Use the `revit-assistant` prompt for complex tasks:

```
gemini prompt revit-assistant --task "create office layout"
  --context "4x5 meters, one door, two windows"
```

## Error Messages

### Common Errors and Fixes

**"Not connected to Revit"**

- Ensure Revit is running
- Check add-in is loaded
- Verify WebSocket connection

**"Element not found"**

- Verify element ID
- Check element wasn't deleted
- Ensure correct project is active

**"Parameter is read-only"**

- Some parameters can't be modified
- Suggest alternative approach
- Explain why parameter is locked

**"Transaction failed"**

- Another transaction might be active
- Element might be locked by another user
- Provide workaround or retry logic

## Testing Scenarios

### Unit Tests

- Tool registration
- Input validation
- Error handling
- Response formatting

### Integration Tests

- Connection management
- Command execution
- Data serialization
- Timeout handling

### End-to-End Tests

- Complete workflows
- User confirmation flows
- Error recovery
- Performance under load

## Performance Considerations

### Optimization

- Batch similar operations
- Cache element queries
- Minimize round trips to Revit
- Use filters to reduce data transfer

### Limits

- Maximum 1000 elements per query
- 30-second timeout per operation
- Recommend breaking large operations into chunks

## Security

### Safe Operations

- Validate all inputs
- Sanitize element IDs
- Check permissions before modifications
- Log all destructive operations

### User Privacy

- Don't expose sensitive project data
- Respect data protection settings
- Follow company security policies

## Future Enhancements

### Planned Features

- Visual selection in Revit UI
- Undo/redo support
- Collaboration awareness
- Schedule integration
- Sheet management
- Family editing
- Rendering control

### AI Improvements

- Computer vision for element recognition
- Predictive element placement
- Automated code compliance checking
- Design optimization suggestions
- Cost estimation integration
