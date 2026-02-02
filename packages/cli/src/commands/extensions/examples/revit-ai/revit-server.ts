/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'revit-ai-assistant',
  version: '1.0.0',
});

// Tool: Parse natural language command for Revit
server.registerTool(
  'parse_revit_command',
  {
    description:
      'Parses a natural language command and identifies the Revit operation, parameters, and confidence level',
    inputSchema: z.object({
      command: z
        .string()
        .describe('Natural language command from user (e.g., "create a wall")'),
    }).shape,
  },
  async ({ command }) => {
    // This is a mock implementation. In a real scenario, this would:
    // 1. Use NLP/LLM to parse the command
    // 2. Map to specific Revit API calls
    // 3. Extract parameters and validate them

    const lowerCommand = command.toLowerCase();
    let operation = 'unknown';
    let params = {};
    let confidence = 0.5;
    const recommendations: string[] = [];

    // Simple pattern matching (in production, use more sophisticated NLP)
    if (lowerCommand.includes('create') || lowerCommand.includes('add')) {
      if (lowerCommand.includes('wall')) {
        operation = 'create_wall';
        confidence = 0.85;
        params = {
          type: 'generic',
          height: '3000mm',
          length: 'to be determined',
        };
        recommendations.push('Please confirm wall dimensions and type');
      } else if (
        lowerCommand.includes('door') ||
        lowerCommand.includes('window')
      ) {
        operation = lowerCommand.includes('door')
          ? 'create_door'
          : 'create_window';
        confidence = 0.8;
        recommendations.push('Please specify family and location');
      } else if (lowerCommand.includes('room')) {
        operation = 'create_room';
        confidence = 0.75;
        recommendations.push('Please confirm room boundaries');
      }
    } else if (
      lowerCommand.includes('delete') ||
      lowerCommand.includes('remove')
    ) {
      operation = 'delete_element';
      confidence = 0.7;
      recommendations.push('Please confirm which elements to delete');
    } else if (
      lowerCommand.includes('modify') ||
      lowerCommand.includes('change')
    ) {
      operation = 'modify_element';
      confidence = 0.65;
      recommendations.push('Please specify what to modify and new values');
    }

    if (confidence < 0.7) {
      recommendations.push(
        'Command clarity is low. Please provide more specific details.',
      );
      recommendations.push(
        'Consider including: element type, dimensions, location, and material.',
      );
    }

    const response = {
      understood: operation !== 'unknown',
      operation,
      parameters: params,
      confidence,
      recommendations,
      requiresConfirmation: confidence < 0.85,
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  },
);

// Tool: Get Revit project information
server.registerTool(
  'get_revit_project_info',
  {
    description: 'Retrieves information about the current Revit project',
    inputSchema: z.object({}).shape,
  },
  async () => {
    // Mock implementation - would connect to actual Revit API in production
    const projectInfo = {
      name: 'Sample Project',
      status: 'Not connected',
      message:
        'This is a mock response. Connect to Revit API through a .NET bridge for actual data.',
      note: 'A real implementation would require a Revit add-in that exposes an API endpoint',
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(projectInfo, null, 2),
        },
      ],
    };
  },
);

// Tool: Execute Revit command with confirmation
server.registerTool(
  'execute_revit_command',
  {
    description:
      'Executes a confirmed Revit command. Should only be called after user confirmation.',
    inputSchema: z.object({
      operation: z.string().describe('The Revit operation to execute'),
      parameters: z.record(z.unknown()).describe('Operation parameters'),
      confirmed: z
        .boolean()
        .describe('Whether the user has confirmed this action'),
    }).shape,
  },
  async ({ operation, parameters, confirmed }) => {
    if (!confirmed) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Operation not confirmed by user',
            }),
          },
        ],
      };
    }

    // Mock implementation - would connect to actual Revit API in production
    const result = {
      success: true,
      operation,
      parameters,
      message:
        'Mock execution successful. In production, this would call Revit API through a .NET bridge.',
      note: 'A real implementation requires a Revit add-in with command handlers',
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
);

// Prompt: Revit command assistant
server.registerPrompt(
  'revit-assistant',
  {
    title: 'Revit Command Assistant',
    description:
      'Helps formulate and execute Revit commands from natural language',
    argsSchema: {
      task: z
        .string()
        .describe('The task the user wants to accomplish in Revit'),
    },
  },
  ({ task }) => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `I need to ${task} in Revit. Please help me:
1. Parse my request using the parse_revit_command tool
2. Show me what you understood and ask for confirmation if needed
3. Provide recommendations for completing this task properly
4. Once confirmed, guide me through execution`,
        },
      },
    ],
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);
