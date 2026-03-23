# Aurevo Quick Start Guide

Get up and running with Aurevo in 5 minutes!

## 1. Prerequisites

✅ [Gemini CLI installed](https://geminicli.com/docs/)  
✅ Node.js 20 or higher  
✅ A Google account OR Gemini API key

## 2. Copy Aurevo to Your Project

```bash
# Navigate to your Revit project folder
cd /path/to/your/revit/project

# Copy the Aurevo configuration files
cp -r /path/to/gemini-cli/examples/aurevo-revit-assistant/.gemini .
cp /path/to/gemini-cli/examples/aurevo-revit-assistant/GEMINI.md .
```

## 3. Start Gemini CLI

```bash
gemini
```

If this is your first time, you'll be prompted to authenticate. Choose "Login with Google" for the free tier.

## 4. Try Your First Command

```
> /aurevo:help
```

You should see Aurevo's welcome message and capability list.

## 5. Test Image Analysis

Upload a screenshot of a Revit view (or use any Revit-related image):

```
> @screenshot.png
> /aurevo:analyze-view
```

Aurevo will analyze the image and tell you what it sees.

## 6. Ask Questions in Natural Language

```
> How do I create a view template for floor plans?
```

```
> What's the best way to organize sheets in a large project?
```

```
> Explain how to create shared parameters
```

## Common Use Cases

### Create a Schedule
```
> Create a window schedule showing Mark, Type, Width, Height, and Sill Height
```

### Hide Elements
```
> Hide all furniture and plumbing fixtures in Level 1 floor plan
```

### Analyze Reference Work
```
> @reference-detail.jpg
> /aurevo:copy-task
```

### Get Revit API Help
```
> Write a Python script using pyRevit to renumber all sheets
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Customize `GEMINI.md` with your firm's standards
- Create additional custom commands in `.gemini/commands/aurevo/`
- Explore the [Gemini CLI documentation](https://geminicli.com/docs/)

## Need Help?

- Run `/aurevo:help` for assistance
- Check the [troubleshooting section](README.md#troubleshooting)
- Open an issue on [GitHub](https://github.com/Fawazkalliyath/gemini-cli/issues)

---

**That's it!** You're now ready to use Aurevo for your Revit workflows. 🚀
