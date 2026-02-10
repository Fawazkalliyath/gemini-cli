# Revit Automation with Gemini CLI

This guide explains how to use Gemini CLI for Revit automation, parametric
design, and template creation workflows.

## Overview

Gemini CLI provides specialized commands that help you generate Revit API code
for common automation tasks. These commands leverage AI to create
production-ready C# or Python code that follows Revit API best practices.

## Available Commands

### Parametric Design: `/revit:parametric-design`

Generate parametric Revit families or components with adaptive parameters,
formulas, and geometric relationships.

**Use cases:**

- Create custom parametric families from scratch
- Add intelligent parameter relationships
- Implement formula-based geometry
- Build adaptive components

**Example:**

```bash
gemini
> /revit:parametric-design Create a parametric window family with adjustable height, width, and mullion spacing. Include parameters for glass type and frame material.
```

The command will generate complete C# or Python code including:

- Parameter definitions with proper types
- Formula relationships between parameters
- Geometry creation code
- Transaction handling
- Usage examples

### Template Builder: `/revit:template-builder`

Automate the creation of standardized Revit templates with all necessary
settings, families, and standards.

**Use cases:**

- Set up company standards
- Create discipline-specific templates
- Automate view template creation
- Configure project parameters

**Example:**

```bash
gemini
> /revit:template-builder Build a structural engineering template with AISC standards, including view templates for framing plans, foundation plans, and details. Add standard annotation families and line styles.
```

Generates:

- Project configuration code
- View template setup
- Family loading scripts
- Standards configuration
- JSON config files for customization

### Family Automation: `/revit:family-automation`

Batch process families or automate family creation and modification.

**Use cases:**

- Batch update family parameters
- Create families from templates
- Extract family information
- Modify family geometry
- Manage family types

**Example:**

```bash
gemini
> /revit:family-automation Batch process all lighting fixture families in a folder, adding new parameters for wattage, lumens, and color temperature
```

Generates:

- File processing loops
- Family opening/saving code
- Parameter manipulation
- Error handling and logging
- Progress tracking

### Schedule Operations: `/revit:schedule-extractor`

Work with Revit schedules - create, extract, or modify schedule data.

**Use cases:**

- Export schedules to Excel/CSV
- Create schedules programmatically
- Modify schedule formatting
- Aggregate schedule data
- Generate reports

**Example:**

```bash
gemini
> /revit:schedule-extractor Extract all room schedules from the current project and export to Excel with formatting. Include area calculations and grouping by department.
```

Generates:

- Schedule traversal code
- Data extraction logic
- Export functionality
- Formatting options
- Multiple output format support

### Workflow Automation: `/revit:workflow-automation`

Automate complex multi-step workflows and batch operations.

**Use cases:**

- Process multiple Revit files
- Coordinate linked models
- Run quality assurance checks
- Synchronize model data
- Generate compliance reports

**Example:**

```bash
gemini
> /revit:workflow-automation Create a workflow to process 100 Revit files: update shared parameters, export schedules, run model health checks, and generate a summary report
```

Generates:

- Batch processing framework
- Error handling and recovery
- Progress reporting
- Logging infrastructure
- Configuration file support

### Element Manipulation: `/revit:element-manipulation`

Select, filter, and modify Revit elements using optimized queries.

**Use cases:**

- Query elements by category
- Apply complex filters
- Update element parameters
- Modify element geometry
- Handle element relationships

**Example:**

```bash
gemini
> /revit:element-manipulation Select all walls on Level 2 with height greater than 10 feet and update their fire rating parameter to "2 Hour"
```

Generates:

- FilteredElementCollector code
- Parameter filters
- LINQ queries
- Transaction handling
- Performance-optimized queries

## Getting Started

### 1. Setup

Install Gemini CLI and ensure you're authenticated:

```bash
npm install -g @google/gemini-cli
gemini
```

### 2. Navigate to Your Revit Project

```bash
cd /path/to/revit/project
gemini
```

### 3. Use a Revit Command

Simply type a slash command followed by your requirements:

```
> /revit:parametric-design Create a parametric desk family with adjustable width, depth, and height
```

### 4. Review and Use Generated Code

Gemini CLI will generate:

- Complete, working Revit API code
- Detailed comments and documentation
- Usage instructions
- Configuration examples

Copy the generated code into your Revit add-in, pyRevit script, or Dynamo Python
node.

## Best Practices

### 1. Be Specific with Requirements

**Good:**

```
/revit:family-automation Create a batch processor that opens all door families in C:\Families\Doors, adds a "Hardware Set" text parameter in the Identity Data group, and saves them with "_Updated" suffix
```

**Less effective:**

```
/revit:family-automation Update some families
```

### 2. Specify Language and Version

Always mention:

- **Language**: C# or Python
- **Revit version**: 2020, 2022, 2024, etc.
- **Platform**: pyRevit, Dynamo, standalone add-in

**Example:**

```
/revit:parametric-design Using pyRevit Python for Revit 2024, create a parametric beam family...
```

### 3. Include Error Handling Requirements

Request specific error handling:

```
/revit:workflow-automation Include try-catch blocks for file access errors, transaction failures, and parameter read-only exceptions. Log all errors to a CSV file.
```

### 4. Request Configuration Support

For flexible automation, ask for configuration files:

```
/revit:template-builder Include a JSON configuration file for family paths, view template names, and line style definitions so users can customize without modifying code
```

### 5. Test on Sample Data First

Always test generated code on sample files before using on production models:

1. Create test copies of your Revit files
2. Run generated code on test files
3. Verify results
4. Then apply to production files

## Advanced Usage

### Combining Commands

Use multiple commands in sequence:

```bash
# First, generate parametric families
> /revit:parametric-design Create parametric furniture families

# Then, create a template that uses them
> /revit:template-builder Create an interior design template that loads the parametric furniture families

# Finally, create workflow to maintain them
> /revit:workflow-automation Create a workflow to batch update all furniture families when standards change
```

### Custom Context

Create a `GEMINI.md` file in your project to provide context:

```markdown
# Project: Office Building Renovation

# Revit Version: 2024

# Standards: Company BIM Manual v3.2

# Language Preference: C# for add-ins

Our standard parameters:

- Project Number (text)
- Design Phase (text)
- Responsible Party (text)
```

Then Gemini CLI will automatically include this context in code generation.

### Integration with Existing Code

Request code that integrates with your existing infrastructure:

```
/revit:element-manipulation Generate code that uses our existing DatabaseManager class and LoggerService for consistency with our current add-in
```

## Common Patterns

### Pattern 1: Parametric Family Creation

```
/revit:parametric-design Create a parametric structural column family with:
- Height parameter (instance)
- Width and Depth parameters (type)
- Formula: Area = Width * Depth
- Conditional visibility for base plate based on "Has Base Plate" yes/no parameter
```

### Pattern 2: Batch Family Processing

```
/revit:family-automation Process all families in folder:
1. Open each family
2. Add shared parameter "Manufacturer"
3. Add shared parameter "Model Number"
4. Create two types: "Standard" and "Premium"
5. Save and close
6. Log results to CSV
```

### Pattern 3: Template Setup

```
/revit:template-builder Create MEP template with:
- Imperial units
- View templates for HVAC, Plumbing, Electrical plans
- Standard mechanical equipment families
- Shared parameters from attached .txt file
- Color schemes for systems
```

### Pattern 4: Schedule Export

```
/revit:schedule-extractor Extract all schedules and:
1. Export each to separate Excel file
2. Format headers with bold text
3. Add summary row with totals
4. Include filters applied
5. Save in "Exports" folder with timestamp
```

### Pattern 5: Model Audit Workflow

```
/revit:workflow-automation Create audit workflow:
1. Open each Revit file in folder
2. Check for warnings
3. Verify all views have view templates
4. Check for unused families
5. Export warnings to CSV
6. Generate HTML summary report
```

## Tips and Tricks

### 1. Use for Learning

Even if you're experienced with Revit API, use these commands to:

- See modern API patterns
- Learn new API methods
- Get code structure examples
- Understand best practices

### 2. Iterate and Refine

Start with a basic request, then refine:

```
> /revit:parametric-design Create a parametric door family

# Review output, then refine:
> Add opening cut parameters and wall thickness detection to the door family code
```

### 3. Ask for Explanations

Request explanations of complex concepts:

```
> Explain how the FamilyManager.AddParameter method works in the generated code and why you chose those parameter types
```

### 4. Request Alternatives

Ask for different approaches:

```
> Show me an alternative implementation using the DirectShape API instead of FamilyInstance
```

### 5. Get Testing Code

Request test code along with main code:

```
/revit:workflow-automation Include unit test methods for each operation in the workflow
```

## Troubleshooting

### Generated Code Doesn't Compile

**Issue**: Code has compilation errors

**Solutions**:

1. Check Revit API version matches your installation
2. Verify all referenced assemblies are available
3. Ask Gemini CLI to fix specific errors:
   ```
   > Fix the compilation error: 'Document does not contain a definition for NewFamilyDocument'
   ```

### Code Runs But Produces Unexpected Results

**Issue**: Code executes but doesn't do what you expected

**Solutions**:

1. Add debugging output:
   ```
   > Add Console.WriteLine statements to debug the element selection logic
   ```
2. Request validation code:
   ```
   > Add validation checks before and after each operation
   ```

### Performance Issues

**Issue**: Code is slow with large models

**Solutions**:

1. Request optimization:
   ```
   > Optimize the FilteredElementCollector query for better performance with large models
   ```
2. Ask for profiling code:
   ```
   > Add stopwatch timing to identify slow operations
   ```

## Resources

### Revit API Documentation

- [Revit API Developer's Guide](https://www.revitapidocs.com/)
- [Revit API Forum](https://forums.autodesk.com/t5/revit-api-forum/bd-p/160)

### pyRevit Resources

- [pyRevit Documentation](https://pyrevitlabs.github.io/pyRevit/)
- [pyRevit GitHub](https://github.com/eirannejad/pyRevit)

### Gemini CLI Documentation

- [Custom Commands Guide](./custom-commands.md)
- [GEMINI.md Context Files](./gemini-md.md)
- [Extensions Overview](../extensions/index.md)

## Examples Gallery

### Example 1: Adaptive Parametric Family

**Request:**

```
/revit:parametric-design Create an adaptive curtain wall panel family with:
- 4 adaptive points
- Adjustable panel thickness
- Pattern-based mullion layout
- Formula-driven geometry
```

**Output:** Complete C# code with adaptive component creation, reference point
handling, and pattern-based geometry.

### Example 2: Standards Template

**Request:**

```
/revit:template-builder Create architectural template following National CAD Standard:
- A-series sheet sizes
- Standard annotation families
- AIA layer conventions via view templates
- Keynote legend setup
```

**Output:** Complete template builder with configuration files and setup
instructions.

### Example 3: Quality Assurance Workflow

**Request:**

```
/revit:workflow-automation Create QA workflow:
- Check all rooms are bounded
- Verify all doors have room tags
- Find unplaced elements
- Check model against standards
- Generate PDF report
```

**Output:** Comprehensive workflow code with checks, reporting, and HTML output.

## Support

For issues or questions:

1. Use `/bug` command in Gemini CLI to report issues
2. Check [Troubleshooting Guide](../troubleshooting.md)
3. Visit [GitHub Issues](https://github.com/google-gemini/gemini-cli/issues)

---

**Note:** This feature is part of Gemini CLI's extensible command system. The
Revit commands are custom commands that can be modified or extended for your
specific needs.
