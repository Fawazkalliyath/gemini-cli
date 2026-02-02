/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  GetElementsInputSchema,
  CreateElementInputSchema,
  ModifyElementInputSchema,
  DeleteElementInputSchema,
} from './types.js';
import { RevitBridge } from './revit-bridge.js';

const server = new McpServer({
  name: 'revit-ai-extension',
  version: '1.0.0',
});

const revitBridge = new RevitBridge();

server.registerTool(
  'get_elements',
  {
    description:
      'Query elements from the active Revit project by category, family, or level. Returns a list of elements with their properties.',
    inputSchema: GetElementsInputSchema.shape,
  },
  async (input) => {
    try {
      const elements = await revitBridge.getElements(input);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                count: elements.length,
                elements,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Unknown error occurred',
            }),
          },
        ],
        isError: true,
      };
    }
  },
);

server.registerTool(
  'create_element',
  {
    description:
      'Create a new element in Revit (wall, door, window, etc.). Requires category, family, type, and location. Optionally accepts parameters to set. By default, requires user confirmation before creating.',
    inputSchema: CreateElementInputSchema.shape,
  },
  async (input) => {
    try {
      if (input.confirmationRequired) {
        const confirmation = {
          type: 'confirmation_required',
          action: 'create_element',
          details: {
            category: input.category,
            family: input.family,
            type: input.type,
            location: input.location,
            parameters: input.parameters,
          },
          message:
            'Please confirm: Create new element with the specified properties?',
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(confirmation, null, 2),
            },
          ],
        };
      }

      const element = await revitBridge.createElement(input);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                message: 'Element created successfully',
                element,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Unknown error occurred',
            }),
          },
        ],
        isError: true,
      };
    }
  },
);

server.registerTool(
  'modify_element',
  {
    description:
      'Modify an existing element in Revit by updating its parameters. Requires element ID and parameter values. By default, requires user confirmation before modifying.',
    inputSchema: ModifyElementInputSchema.shape,
  },
  async (input) => {
    try {
      if (input.confirmationRequired) {
        const element = await revitBridge.getElementById(input.elementId);

        const confirmation = {
          type: 'confirmation_required',
          action: 'modify_element',
          details: {
            elementId: input.elementId,
            currentElement: element,
            newParameters: input.parameters,
          },
          message: `Please confirm: Modify element "${element.name}" with new parameters?`,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(confirmation, null, 2),
            },
          ],
        };
      }

      const element = await revitBridge.modifyElement(input);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                message: 'Element modified successfully',
                element,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Unknown error occurred',
            }),
          },
        ],
        isError: true,
      };
    }
  },
);

server.registerTool(
  'delete_element',
  {
    description:
      'Delete an element from Revit. Requires element ID. By default, requires user confirmation before deleting.',
    inputSchema: DeleteElementInputSchema.shape,
  },
  async (input) => {
    try {
      if (input.confirmationRequired) {
        const element = await revitBridge.getElementById(input.elementId);

        const confirmation = {
          type: 'confirmation_required',
          action: 'delete_element',
          details: {
            elementId: input.elementId,
            element,
          },
          message: `Please confirm: Delete element "${element.name}"? This action cannot be undone.`,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(confirmation, null, 2),
            },
          ],
        };
      }

      await revitBridge.deleteElement(input);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                message: 'Element deleted successfully',
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Unknown error occurred',
            }),
          },
        ],
        isError: true,
      };
    }
  },
);

server.registerTool(
  'get_project_info',
  {
    description:
      'Get information about the currently active Revit project, including name, author, building name, and other metadata.',
    inputSchema: {},
  },
  async () => {
    try {
      const projectInfo = await revitBridge.getProjectInfo();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                projectInfo,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Unknown error occurred',
            }),
          },
        ],
        isError: true,
      };
    }
  },
);

server.registerTool(
  'get_connection_status',
  {
    description:
      'Check the connection status with Revit, including whether Revit is running, connected, and if a project is loaded.',
    inputSchema: {},
  },
  async () => {
    const status = revitBridge.getConnectionStatus();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              status,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

server.registerPrompt(
  'revit-assistant',
  {
    title: 'Revit AI Assistant',
    description:
      'AI-powered assistant for Revit tasks with context-aware suggestions',
    argsSchema: {
      task: {
        type: 'string',
        description: 'The task you want to perform in Revit',
      },
      context: {
        type: 'string',
        description:
          'Additional context about the current project or situation',
        optional: true,
      },
    },
  },
  ({ task, context }) => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `You are an expert Revit AI assistant helping users with their architectural and BIM tasks.
          
Task: ${task}
${context ? `Context: ${context}` : ''}

Please provide:
1. A clear understanding of what needs to be done
2. Step-by-step instructions for accomplishing the task
3. Any important considerations or best practices
4. Potential alternatives or optimizations

If the task is complex or could have multiple interpretations, ask clarifying questions before proceeding.`,
        },
      },
    ],
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);

process.on('SIGINT', async () => {
  await revitBridge.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await revitBridge.disconnect();
  process.exit(0);
});
