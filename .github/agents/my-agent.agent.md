# Revit Automation Agent

## Purpose

This agent assists with Revit automation, parametric design, and template
creation using the Gemini CLI custom commands system.

## Available Commands

Gemini CLI includes specialized commands for Revit automation workflows:

### /revit:parametric-design

Generate parametric Revit family or component code with adaptive parameters,
formulas, and constraints.

**Example usage:**

```
/revit:parametric-design Create a parametric door family with adjustable height, width, and frame depth parameters
```

### /revit:template-builder

Create automated Revit template setup with standards, families, view templates,
and configurations.

**Example usage:**

```
/revit:template-builder Build an architectural template with AIA standards, including view templates for plans, sections, and elevations
```

### /revit:family-automation

Automate Revit family creation, modification, or batch processing operations.

**Example usage:**

```
/revit:family-automation Batch update all door families to add a new "Fire Rating" parameter
```

### /revit:schedule-extractor

Extract, process, or create Revit schedules with custom formatting and data
manipulation.

**Example usage:**

```
/revit:schedule-extractor Extract all room schedules and export to CSV with area calculations
```

### /revit:workflow-automation

Generate code for automating Revit workflows with batch operations and
multi-model coordination.

**Example usage:**

```
/revit:workflow-automation Create a workflow to process 50 Revit files and standardize their view templates
```

### /revit:element-manipulation

Generate Revit API code for element selection, filtering, and manipulation using
optimized queries.

**Example usage:**

```
/revit:element-manipulation Select all walls on Level 1 and update their fire rating parameter
```

## Best Practices

1. **Always specify requirements clearly** - Include details about Revit
   version, API language preference (C# or Python), and specific constraints
2. **Test with sample data first** - Generate code on test files before running
   on production models
3. **Use transactions properly** - All modifications must be wrapped in
   transactions
4. **Handle errors gracefully** - Include try-catch blocks and validation logic
5. **Document your code** - Generated code should include comments explaining
   the logic

## Tips for Effective Revit Automation

- Specify whether you need C# (for add-ins) or Python (for pyRevit/Dynamo)
- Include details about target Revit version for API compatibility
- Mention if you need batch processing capabilities
- Specify desired output formats for data extraction
- Indicate if you need configuration file support for flexible automation
