# Aurevo - Revit AI Assistant

**Aurevo** is a specialized configuration for Gemini CLI that transforms it into an expert Revit and BIM assistant. It provides natural language understanding, image analysis capabilities, and Revit-specific workflows to help you work more efficiently with Autodesk Revit.

![Aurevo Banner](https://img.shields.io/badge/Aurevo-Revit%20AI%20Assistant-blue)
![Powered by Gemini CLI](https://img.shields.io/badge/Powered%20by-Gemini%20CLI-green)

## What is Aurevo?

Aurevo is not a standalone application—it's a **preconfigured Gemini CLI setup** optimized for Revit professionals. It includes:

- 🧠 **Revit domain expertise** built into the AI's context
- 🖼️ **Image understanding** for analyzing Revit views and sheets  
- 💬 **Natural language processing** for plain-English commands
- ✅ **Permission-based workflow** that asks before making changes
- 🎯 **Task replication** from reference project images
- 📚 **Custom commands** for common Revit operations

## Features

### 1. Natural Language Understanding
Talk to Aurevo like you would a colleague:
- "Make all walls on Level 1 invisible in the floor plan"
- "Create a door schedule sorted by fire rating"
- "How do I nest a family inside another family?"

### 2. Image Analysis
Upload screenshots of:
- Revit views (plans, sections, elevations)
- Completed sheets from other projects
- Detail views you want to replicate
- UI screenshots for workflow questions

Aurevo will analyze the image and help you:
- Understand what's shown
- Replicate the work in your project
- Learn the techniques used

### 3. Smart Permission System
Before making any changes, Aurevo:
1. Describes what it's about to do (brief, 1-2 sentences)
2. Asks for your permission
3. Waits for confirmation
4. Executes only after you approve

### 4. Minimal Clarifying Questions
When your request needs clarification, Aurevo asks focused questions:
- Maximum 2-3 questions at a time
- Provides context for why it's asking
- Suggests sensible defaults
- Gets straight to the point

### 5. View-Aware Operations
For tasks involving specific views, Aurevo:
- Asks which view to work in
- Lists available options
- Remembers context for follow-up operations
- Confirms before applying changes

## Installation

### Prerequisites
- [Gemini CLI](https://github.com/google-gemini/gemini-cli) installed
- Node.js 20 or higher
- A Google account (for free tier) or Gemini API key

### Setup

1. **Clone or download this configuration**:
   ```bash
   # If cloning the whole repo
   git clone https://github.com/Fawazkalliyath/gemini-cli.git
   cd gemini-cli/examples/aurevo-revit-assistant
   
   # Or just download the aurevo-revit-assistant folder
   ```

2. **Use Aurevo in your Revit project**:
   ```bash
   # Navigate to your Revit project folder
   cd /path/to/your/revit/project
   
   # Copy the Aurevo configuration
   cp -r /path/to/aurevo-revit-assistant/.gemini .
   cp /path/to/aurevo-revit-assistant/GEMINI.md .
   
   # Start Gemini CLI
   gemini
   ```

3. **Authenticate** (first time only):
   - Choose "Login with Google" for free tier
   - Or set your API key: `export GEMINI_API_KEY="your-key"`

4. **You're ready!** Aurevo is now active in this project directory.

## Usage

### Getting Started

Start Gemini CLI in your project directory:
```bash
gemini
```

Try the help command:
```
> /aurevo:help
```

### Basic Commands

#### Get Revit Help
```
> /aurevo:help
```
Shows available capabilities and example usage.

#### Analyze a View
```
> @screenshot.png
> /aurevo:analyze-view
```
Analyzes a Revit view from an uploaded image and provides detailed insights.

#### Copy a Task from Reference
```
> @reference-detail.png
> /aurevo:copy-task
```
Helps you replicate work shown in a reference project image.

### Example Workflows

#### Example 1: Creating a Custom Schedule
```
> Create a door schedule that shows Mark, Type, Fire Rating, and Width, 
  sorted by Fire Rating descending

Aurevo: I'll create a new schedule with those fields and sorting.
        This will be added to your project browser under Schedules/Quantities.
        
        Proceed? (yes/no)

> yes

Aurevo: Schedule created: "Door Schedule - Fire Rating".
        You can find it in your Project Browser. Done.
```

#### Example 2: Analyzing and Replicating a Detail
```
> @wall-section-detail.jpg
> This is from another project. I need the same detail in my current project.

Aurevo: I can see this is a wall section detail showing:
        - 3-layer exterior wall assembly
        - Continuous insulation detail
        - Base and head flashing details
        - Dimension strings for layer thickness
        
        To replicate this, I'll need:
        1. Should I create a new wall type or modify an existing one?
        2. Which section view should I work in?
        
        List your section views, or should I create a new one?

> Create new wall type called "Exterior Wall - Type A"
> Use section view "Building Section 1"

Aurevo: I'll create a new wall type and add the detail components.
        
        Steps I'll guide you through:
        1. Create new wall type with 3 layers
        2. Set up the section view with proper scale
        3. Add detail components for flashing and sealant
        4. Add dimension strings
        
        Ready to start with step 1? (yes/no)
```

#### Example 3: View Management
```
> Hide all furniture and plumbing fixtures in my floor plan

Aurevo: I'll apply a visibility override to hide Furniture and Plumbing Fixtures.
        
        Which floor plan view?
        1. Level 1 - Floor Plan
        2. Level 2 - Floor Plan
        3. Basement - Floor Plan

> 1

Aurevo: Applied visibility override to "Level 1 - Floor Plan".
        Furniture and Plumbing Fixtures are now hidden. Done.
```

#### Example 4: Understanding a Workflow
```
> @revit-ui-screenshot.png
> How do I do what's shown here?

Aurevo: This screenshot shows the process of creating a view template.
        
        Here's how to do it:
        1. Right-click on any view in Project Browser
        2. Select "Create View Template From View..."
        3. Name your template (shown as "Standard Floor Plan" in image)
        4. Choose which properties to include
        5. Click OK
        
        Would you like me to guide you through creating a specific view template?
```

## Custom Commands Reference

Aurevo includes three specialized commands:

### `/aurevo:help`
Get help with Revit tasks and see examples of what Aurevo can do.

**Usage**:
```
> /aurevo:help
```

### `/aurevo:analyze-view`
Analyze an image of a Revit view to understand its elements, settings, and organization.

**Usage**:
```
> @floor-plan.png
> /aurevo:analyze-view
```

**What it tells you**:
- View type (plan, section, elevation, etc.)
- Elements present
- View settings (scale, detail level)
- Annotations and dimensions
- Naming standards
- Complexity assessment

### `/aurevo:copy-task`
Replicate a task or workflow from a reference project image.

**Usage**:
```
> @reference-work.png
> /aurevo:copy-task
```

**What it does**:
- Identifies what was done
- Breaks down into steps
- Asks where to apply it
- Guides you through replication
- Checks for permission at each step

## Tips and Best Practices

### Working with Images
- **Use clear screenshots**: Make sure text is readable
- **Include context**: Show enough of the UI to understand what view you're in
- **Multiple angles**: For complex 3D work, provide multiple viewpoints
- **Annotate if needed**: You can mark up images before uploading

### Effective Prompts
- **Be specific**: "Hide all doors on Level 1" vs "Hide some stuff"
- **Provide context**: Mention view names, element types, parameter values
- **Use Revit terminology**: Aurevo understands Revit-specific terms
- **Show, don't just tell**: Upload images when describing visual requirements

### Project Organization
- **Use GEMINI.md**: Add project-specific standards to your GEMINI.md file
- **Document conventions**: Tell Aurevo about your naming standards
- **Reference templates**: Mention your standard view templates and families
- **Note exceptions**: Explain any project-specific requirements

## Advanced Configuration

### Customizing Aurevo for Your Firm

Edit the `GEMINI.md` file to add your firm's standards:

```markdown
## Our Firm Standards

### Naming Conventions
- View names: `[Level]-[Discipline]-[Type]-[Number]`
- Family names: `[Category]_[Type]_[Size]`
- Sheet numbers: `[Discipline][Type]-[Number]`

### View Templates
We use these standard templates:
- "Standard Floor Plan" - Scale 1/8"
- "Standard Section" - Scale 1/4"
- "Enlarged Plan" - Scale 1/4"

### Parameters
All families must include:
- "Cost_Code" (Text)
- "Install_Phase" (Text)
- "Warranty_Years" (Integer)
```

### Adding More Commands

Create new `.toml` files in `.gemini/commands/aurevo/`:

```toml
# .gemini/commands/aurevo/check-phases.toml
description = "Check which phase an element belongs to"

prompt = """
Analyze the selected element(s) and report:
1. Phase Created
2. Phase Demolished (if any)
3. Which views show this element
4. Any phase-related warnings

Provide this information in a clear, tabular format.
"""
```

### Integration with MCP Servers

If you have Revit automation tools, you can integrate them via MCP servers. See the [MCP Server Integration Guide](../../docs/tools/mcp-server.md).

Example MCP server for Revit:
```json
{
  "mcpServers": {
    "revit-automation": {
      "command": "python",
      "args": ["revit_mcp_server.py"],
      "env": {
        "REVIT_VERSION": "2024"
      }
    }
  }
}
```

## Limitations

### What Aurevo Cannot Do
- **Direct Revit manipulation**: Aurevo provides guidance and instructions but cannot directly modify your Revit files
- **Real-time Revit integration**: No live connection to Revit (unless you build an MCP server for that)
- **Plugin installation**: Cannot install Revit add-ins or plugins
- **License management**: Cannot handle Revit licensing

### What Aurevo CAN Do
- ✅ Provide step-by-step instructions
- ✅ Explain Revit concepts and workflows  
- ✅ Analyze images of Revit work
- ✅ Write Revit API code (Python/C#)
- ✅ Review and improve your Revit workflows
- ✅ Answer Revit questions at any skill level
- ✅ Help with BIM standards and best practices

## Troubleshooting

### Aurevo Doesn't Understand My Request
- Use more specific Revit terminology
- Provide an image for visual context
- Break complex requests into smaller steps
- Check that you're using Revit-appropriate language

### Commands Not Working
Verify the setup:
```bash
# Check that GEMINI.md exists
ls -la GEMINI.md

# Check that commands exist
ls -la .gemini/commands/aurevo/

# Start Gemini CLI with verbose mode
gemini --debug
```

### Permission Issues
- Make sure you have write access to your project directory
- Check that `.gemini` folder permissions are correct
- Ensure GEMINI.md is readable

### Image Analysis Not Working
- Ensure your Gemini model supports vision (Gemini 2.0 Pro or later)
- Check image file size (should be < 20MB)
- Use supported formats: PNG, JPEG, WebP
- Make sure the image is clear and readable

## Examples Gallery

### Before and After: Sheet Organization
**Before**: Disorganized sheets with inconsistent naming
**Task**: "Analyze my sheet organization and suggest improvements"
**After**: Aurevo analyzes sheet names, suggests consistent numbering system, helps rename

### Workflow: Creating Custom Families
**Step 1**: Upload reference images of the desired family
**Step 2**: `/aurevo:analyze-view` to understand requirements
**Step 3**: Aurevo provides step-by-step family creation guide
**Result**: Custom family created following best practices

### Workflow: View Template Management
**Task**: "Create a view template that matches this reference view"
**Process**: Upload reference → Aurevo analyzes settings → Creates matching template
**Output**: New view template ready to apply

## FAQ

### Q: Is Aurevo a separate application?
**A**: No, Aurevo is a configuration for Gemini CLI. It's a set of instructions, commands, and context that make Gemini CLI specialized for Revit.

### Q: Do I need a Revit license?
**A**: Aurevo is independent of Revit licensing. However, to use Revit itself, you'll need a valid Autodesk license.

### Q: Can Aurevo modify my Revit files directly?
**A**: No, Aurevo provides instructions and guidance. You'll perform the actions in Revit, or you can build custom automation using the Revit API.

### Q: What Revit versions are supported?
**A**: Aurevo's knowledge covers Revit 2018 through 2024+. It understands version differences and can adapt advice accordingly.

### Q: Is this free?
**A**: Aurevo configuration itself is free. Gemini CLI has a free tier (60 requests/min, 1,000/day) with a Google account.

### Q: Can I use this for commercial projects?
**A**: Yes, this configuration is provided under the same Apache 2.0 license as Gemini CLI.

### Q: How is this different from Revit's built-in help?
**A**: Aurevo provides:
- Natural language understanding (ask in plain English)
- Image analysis (show, don't just describe)
- Context-aware guidance (remembers your project)
- Task automation suggestions (Revit API code)
- Interactive step-by-step workflows

### Q: Can I customize Aurevo for my firm?
**A**: Absolutely! Edit the `GEMINI.md` file to add your standards, naming conventions, and specific workflows.

## Support and Contributing

### Getting Help
- Check the [Gemini CLI documentation](https://geminicli.com/docs/)
- Open an issue on [GitHub](https://github.com/Fawazkalliyath/gemini-cli/issues)
- Join the Gemini CLI community discussions

### Contributing
Improvements to Aurevo are welcome! To contribute:
1. Fork the repository
2. Make your changes to the `examples/aurevo-revit-assistant/` folder
3. Test thoroughly with real Revit workflows
4. Submit a pull request with clear description

### Ideas for Enhancement
- Additional custom commands for specific tasks
- MCP server for actual Revit integration
- Pre-built scripts for common automation
- More comprehensive Revit API examples
- Integration with other BIM tools

## Credits

**Aurevo** was created as an example configuration for Gemini CLI, demonstrating how to specialize the AI for a specific domain (Revit/BIM).

- **Powered by**: [Gemini CLI](https://github.com/google-gemini/gemini-cli) by Google
- **Created for**: Revit and BIM professionals
- **License**: Apache 2.0

## Version History

### v1.0.0 (Initial Release)
- Revit-specialized GEMINI.md context file
- Three custom commands: help, analyze-view, copy-task
- Natural language understanding for Revit tasks
- Image analysis capabilities
- Permission-based workflow system
- Comprehensive documentation

---

**Ready to get started?** Navigate to your Revit project folder, copy the Aurevo configuration files, and run `gemini` to begin!

```bash
cd /path/to/your/revit/project
cp -r /path/to/aurevo-revit-assistant/.gemini .
cp /path/to/aurevo-revit-assistant/GEMINI.md .
gemini
```

Then try:
```
> /aurevo:help
```

Welcome to **Aurevo** - Your Revit AI Assistant! 🏗️✨
