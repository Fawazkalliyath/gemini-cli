# Example: Using Aurevo in a Real Revit Project

This document demonstrates how to use Aurevo in a typical Revit project workflow.

## Project Structure

```
my-revit-project/
├── MyProject.rvt              # Your Revit file
├── GEMINI.md                  # Aurevo configuration
├── .gemini/
│   └── commands/
│       └── aurevo/
│           ├── help.toml
│           ├── analyze-view.toml
│           └── copy-task.toml
└── reference-images/          # Images for analysis
    ├── detail-section.png
    └── sheet-layout.jpg
```

## Example Session 1: Creating a Door Schedule

**Starting the session:**
```bash
cd my-revit-project
gemini
```

**Conversation:**
```
> Create a door schedule with Mark, Type, Fire Rating, Width, Height, and Level, sorted by Level then Fire Rating

Aurevo: I'll create a new door schedule with those 6 fields.
        Sorting: Primary by Level (ascending), Secondary by Fire Rating (descending)
        This will be added to your Project Browser under Schedules/Quantities.
        
        Proceed? (yes/no)

> yes

Aurevo: Here are the step-by-step instructions to create this schedule:

        1. In Project Browser, right-click "Schedules/Quantities" → New Schedule
        2. Select "Doors" from Category list → OK
        3. Add Fields in this order:
           - Mark
           - Type (or Family and Type)
           - Fire Rating
           - Width
           - Height
           - Level
        4. Switch to "Sorting/Grouping" tab:
           - Sort by: Level (Ascending)
           - Then by: Fire Rating (Descending)
        5. Click OK to create
        
        Name suggestion: "Door Schedule - By Level and Fire Rating"
        
        Done! The schedule will update automatically as you add or modify doors.
```

## Example Session 2: Analyzing and Replicating a Wall Detail

**Upload a reference image:**
```
> @reference-images/detail-section.png
> I need to create this same detail in my project
```

**Aurevo's response:**
```
Aurevo: I can see this is a wall section detail showing:
        
        Elements identified:
        - Exterior wall assembly: 3 layers (brick veneer, cavity, CMU backup)
        - Continuous insulation layer (2" thick)
        - Foundation detail at base
        - Flashing at top and bottom
        - Weep holes indicated
        - Dimension strings showing layer thicknesses
        - Material hatches and patterns
        
        To replicate this in your project, I need to know:
        1. Do you have a similar wall type I should modify, or create new?
        2. Which section or detail view should I work in?
        
        Please respond with:
        - Wall type name (existing or new name)
        - Section view name (or "create new")

> Create new wall type called "Exterior Wall - Brick Veneer"
> Use section view "Building Section 1 - Detail"

Aurevo: Perfect! I'll guide you through creating this wall type and detail.
        
        Phase 1: Wall Type (Should take ~5 minutes)
        ----------------------------------------------
        1. Create new wall type with 3 layers
        2. Set layer thicknesses
        3. Assign materials with correct patterns
        4. Add thermal/moisture properties
        
        Ready to start Phase 1? (yes/no)

> yes

Aurevo: Wall Type Creation Steps:
        
        1. Open Wall Types:
           - Architecture tab → Wall → Edit Type
           - Duplicate an existing exterior wall
           - Rename to "Exterior Wall - Brick Veneer"
        
        2. Edit Structure (click Edit button next to Structure):
           Layer 1 (Exterior): Brick Masonry, 4" thick
           Layer 2 (Thermal): Insulation, 2" thick
           Layer 3 (Structure): Concrete Masonry Units, 8" thick
           
        3. Assign Materials:
           - Layer 1: "Brick, Common" (or create custom)
           - Layer 2: "Rigid Insulation"
           - Layer 3: "Masonry - Concrete Block"
        
        4. Set Wrapping at Inserts and Ends:
           - Exterior Layer: Do not wrap
           - Interior Layer: Exterior
        
        Click OK when done.
        
        Done with Phase 1? Ready for Phase 2 (Detail Components)? (yes/no)

> yes

Aurevo: Phase 2: Detail Components (Should take ~10 minutes)
        -------------------------------------------------------
        
        Now we'll add detail components in your section view.
        I'll walk through adding:
        - Flashing details
        - Weep holes
        - Foundation connection
        - Dimensions
        
        [Continues with step-by-step detail instructions...]
```

## Example Session 3: View Template Setup

**Request:**
```
> @reference-images/floor-plan-view.png
> Set up a view template that matches this floor plan's appearance
```

**Aurevo's analysis and response:**
```
Aurevo: Analyzing the floor plan image...
        
        View Settings Detected:
        - Scale: 1/8" = 1'-0"
        - Detail Level: Medium
        - Visual Style: Hidden Line
        - Discipline: Architectural
        
        Display Settings:
        - Walls: Black, line weight 3
        - Doors/Windows: Black, line weight 1
        - Furniture: Halftone, gray
        - Room tags: Visible
        - Area boundaries: Hidden
        - Grid lines: Visible
        
        Annotation Settings:
        - Dimension style: Architectural
        - Text size: 3/32"
        - Leader arrow: Filled triangle
        
        Should I create a view template called "Standard Floor Plan - 1/8 Scale"
        with these settings? (yes/no)

> yes

Aurevo: I'll guide you through creating this view template:
        
        Step 1: Create Template from View
        ----------------------------------
        1. Right-click on a floor plan view in Project Browser
        2. Select "Create View Template From View..."
        3. Name it: "Standard Floor Plan - 1/8 Scale"
        4. Click OK
        
        Step 2: Configure View Properties
        ----------------------------------
        1. In Properties palette, edit the template
        2. Set Scale: 1/8" = 1'-0"
        3. Set Detail Level: Medium
        4. Set Visual Style: Hidden Line
        5. Set Discipline Filter: Architectural
        
        Step 3: Visibility/Graphics
        ---------------------------
        Click "Edit" next to Visibility/Graphics:
        - Doors: Line weight 1
        - Furniture: Check Halftone
        - Windows: Line weight 1
        - Walls: Line weight 3
        - [etc... detailed settings]
        
        [Continues with complete template setup...]
        
        Done! Apply this template to views using:
        Properties → View Template → "Standard Floor Plan - 1/8 Scale"
```

## Example Session 4: Quick Questions

**Various quick interactions:**

```
> How do I make a hosted family?

Aurevo: To create a hosted family:
        
        1. File → New → Family
        2. Choose a hosted template:
           - "Door.rft" for door families
           - "Window.rft" for window families
           - "Generic Model face based.rft" for face-hosted
           - "Generic Model wall based.rft" for wall-hosted
        
        Key differences from non-hosted:
        - Contains host references/constraints
        - Cannot be placed freely in project
        - Automatically maintains relationship with host
        
        Need help with a specific hosted family type?

---

> What's the difference between shared and project parameters?

Aurevo: Quick comparison:
        
        Shared Parameters:
        ✓ Can be scheduled and tagged
        ✓ Can be used across multiple projects
        ✓ Stored in external .txt file
        ✓ Have a GUID identifier
        ✓ Can be included in families
        Use when: Creating schedulable data or tags
        
        Project Parameters:
        ✓ Project-specific only
        ✓ Cannot be tagged
        ✓ Cannot be added to families
        ✓ Stored in project file only
        ✗ Cannot be scheduled (in most cases)
        Use when: Internal tracking or calculations
        
        Need help creating either type?

---

> Write a pyRevit script to select all doors on Level 1

Aurevo: Here's a pyRevit script for that:

```python
"""
Select All Doors on Level 1
"""
from Autodesk.Revit.DB import *
from Autodesk.Revit.UI.Selection import ObjectType

__title__ = 'Select Level 1 Doors'
__author__ = 'Aurevo'

# Get the active document
doc = __revit__.ActiveUIDocument.Document
uidoc = __revit__.ActiveUIDocument

# Find Level 1
levels = FilteredElementCollector(doc)\
    .OfClass(Level)\
    .ToElements()

level_1 = None
for level in levels:
    if level.Name == "Level 1":
        level_1 = level
        break

if not level_1:
    print("Level 1 not found!")
else:
    # Get all doors on Level 1
    door_collector = FilteredElementCollector(doc)\
        .OfCategory(BuiltInCategory.OST_Doors)\
        .WhereElementIsNotElementType()
    
    level_1_doors = []
    for door in door_collector:
        if door.LevelId == level_1.Id:
            level_1_doors.append(door.Id)
    
    # Select the doors
    if level_1_doors:
        uidoc.Selection.SetElementIds(level_1_doors)
        print("Selected {} doors on Level 1".format(len(level_1_doors)))
    else:
        print("No doors found on Level 1")
```

        Save this as a .py file in your pyRevit scripts folder.
        
        Want me to modify it to filter by other criteria?
```

## Tips from These Examples

1. **Be specific with view names**: Aurevo asks which view to work in
2. **Use images liberally**: Visual references help Aurevo understand requirements
3. **Confirm step-by-step**: Aurevo asks permission before each phase
4. **Provide context**: Mention existing families, templates, standards
5. **Ask follow-ups**: Aurevo remembers context within a session

## Customizing for Your Project

Add project-specific information to your `GEMINI.md`:

```markdown
## Our Project Standards

### This Project: "Medical Center Addition"
- Drawing Scale: 1/8" standard, 1/4" for enlarged plans
- View Template: Use "MCA-Floor Plan-Standard"
- Sheet Numbers: A-XXX (Architecture), S-XXX (Structure)
- Level Names: "Level 1", "Level 2", "Roof"

### Family Standards
- Doors: Use "MCA_Door_" prefix
- Windows: Use "MCA_Window_" prefix
- All families must have "Install_Phase" parameter

### Common Room Names
- EX-101 through EX-125 (Existing building)
- ADD-201 through ADD-230 (Addition)
```

This helps Aurevo give more accurate, project-specific guidance!

## Next Steps

- Explore more complex workflows
- Create custom commands for repeated tasks  
- Integrate with Revit API for automation
- Share configurations with your team

Happy modeling! 🏗️
