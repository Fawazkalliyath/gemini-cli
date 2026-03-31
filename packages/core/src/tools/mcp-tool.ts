/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { safeJsonStringify } from '../utils/safeJsonStringify.js';
import type {
  ToolCallConfirmationDetails,
  ToolInvocation,
  ToolMcpConfirmationDetails,
  ToolResult,
} from './tools.js';
import {
  BaseDeclarativeTool,
  BaseToolInvocation,
  Kind,
  ToolConfirmationOutcome,
} from './tools.js';
import type { CallableTool, FunctionCall, Part } from '@google/genai';
import { ToolErrorType } from './tool-error.js';
import type { Config } from '../config/config.js';
import type { MessageBus } from '../confirmation-bus/message-bus.js';
import { debugLogger } from '../utils/debugLogger.js';

type ToolParams = Record<string, unknown>;

// Discriminated union for MCP Content Blocks to ensure type safety.
type McpTextBlock = {
  type: 'text';
  text: string;
};

type McpMediaBlock = {
  type: 'image' | 'audio';
  mimeType: string;
  data: string;
};

type McpResourceBlock = {
  type: 'resource';
  resource: {
    text?: string;
    blob?: string;
    mimeType?: string;
  };
};

type McpResourceLinkBlock = {
  type: 'resource_link';
  uri: string;
  title?: string;
  name?: string;
};

type McpContentBlock =
  | McpTextBlock
  | McpMediaBlock
  | McpResourceBlock
  | McpResourceLinkBlock;

class DiscoveredMCPToolInvocation extends BaseToolInvocation<
  ToolParams,
  ToolResult
> {
  private static readonly allowlist: Set<string> = new Set();

  constructor(
    private readonly mcpTool: CallableTool,
    readonly serverName: string,
    readonly serverToolName: string,
    readonly displayName: string,
    readonly trust?: boolean,
    params: ToolParams = {},
    private readonly cliConfig?: Config,
    messageBus?: MessageBus,
  ) {
    // Use composite format for policy checks: serverName__toolName
    // This enables server wildcards (e.g., "google-workspace__*")
    // while still allowing specific tool rules

    super(
      params,
      messageBus,
      `${serverName}__${serverToolName}`,
      displayName,
      serverName,
    );
  }

  protected override async getConfirmationDetails(
    _abortSignal: AbortSignal,
  ): Promise<ToolCallConfirmationDetails | false> {
    const serverAllowListKey = this.serverName;
    const toolAllowListKey = `${this.serverName}.${this.serverToolName}`;

    if (this.cliConfig?.isTrustedFolder() && this.trust) {
      return false; // server is trusted, no confirmation needed
    }

    if (
      DiscoveredMCPToolInvocation.allowlist.has(serverAllowListKey) ||
      DiscoveredMCPToolInvocation.allowlist.has(toolAllowListKey)
    ) {
      return false; // server and/or tool already allowlisted
    }

    const confirmationDetails: ToolMcpConfirmationDetails = {
      type: 'mcp',
      title: 'Confirm MCP Tool Execution',
      serverName: this.serverName,
      toolName: this.serverToolName, // Display original tool name in confirmation
      toolDisplayName: this.displayName, // Display global registry name exposed to model and user
      onConfirm: async (outcome: ToolConfirmationOutcome) => {
        if (outcome === ToolConfirmationOutcome.ProceedAlwaysServer) {
          DiscoveredMCPToolInvocation.allowlist.add(serverAllowListKey);
        } else if (outcome === ToolConfirmationOutcome.ProceedAlwaysTool) {
          DiscoveredMCPToolInvocation.allowlist.add(toolAllowListKey);
        }
      },
    };
    return confirmationDetails;
  }

  // Determine if the response contains tool errors
  // This is needed because CallToolResults should return errors inside the response.
  // ref: https://modelcontextprotocol.io/specification/2025-06-18/schema#calltoolresult
  isMCPToolError(rawResponseParts: Part[]): boolean {
    const functionResponse = rawResponseParts?.[0]?.functionResponse;
    const response = functionResponse?.response;

    interface McpError {
      isError?: boolean | string;
    }

    if (response) {
      const error = (response as { error?: McpError })?.error;
      const isError = error?.isError;

      if (error && (isError === true || isError === 'true')) {
        return true;
      }
    }
    return false;
  }

  async execute(signal: AbortSignal): Promise<ToolResult> {
    const functionCalls: FunctionCall[] = [
      {
        name: this.serverToolName,
        args: this.params,
      },
    ];

    debugLogger.log(
      `Executing MCP tool '${this.serverToolName}' from server '${this.serverName}' with params:`,
      this.params,
    );

    // Race MCP tool call with abort signal to respect cancellation
    const rawResponseParts = await new Promise<Part[]>((resolve, reject) => {
      if (signal.aborted) {
        const error = new Error('Tool call aborted');
        error.name = 'AbortError';
        reject(error);
        return;
      }
      const onAbort = () => {
        cleanup();
        const error = new Error('Tool call aborted');
        error.name = 'AbortError';
        reject(error);
      };
      const cleanup = () => {
        signal.removeEventListener('abort', onAbort);
      };
      signal.addEventListener('abort', onAbort, { once: true });

      this.mcpTool
        .callTool(functionCalls)
        .then((res) => {
          cleanup();
          debugLogger.log(
            `MCP tool '${this.serverToolName}' returned ${res?.length || 0} response parts`,
          );
          resolve(res);
        })
        .catch((err) => {
          cleanup();
          debugLogger.error(
            `MCP tool '${this.serverToolName}' failed with error:`,
            err,
          );
          reject(err);
        });
    });

    // Ensure the response is not an error
    if (this.isMCPToolError(rawResponseParts)) {
      const errorMessage = `MCP tool '${
        this.serverToolName
      }' reported tool error for function call: ${safeJsonStringify(
        functionCalls[0],
      )} with response: ${safeJsonStringify(rawResponseParts)}`;
      debugLogger.error(errorMessage);
      return {
        llmContent: errorMessage,
        returnDisplay: `Error: MCP tool '${this.serverToolName}' reported an error.`,
        error: {
          message: errorMessage,
          type: ToolErrorType.MCP_TOOL_ERROR,
        },
      };
    }

    const transformedParts = transformMcpContentToParts(rawResponseParts);

    return {
      llmContent: transformedParts,
      returnDisplay: getStringifiedResultForDisplay(rawResponseParts),
    };
  }

  getDescription(): string {
    return safeJsonStringify(this.params);
  }
}

export class DiscoveredMCPTool extends BaseDeclarativeTool<
  ToolParams,
  ToolResult
> {
  constructor(
    private readonly mcpTool: CallableTool,
    readonly serverName: string,
    readonly serverToolName: string,
    description: string,
    override readonly parameterSchema: unknown,
    readonly trust?: boolean,
    nameOverride?: string,
    private readonly cliConfig?: Config,
    override readonly extensionName?: string,
    override readonly extensionId?: string,
    messageBus?: MessageBus,
  ) {
    super(
      nameOverride ?? generateValidName(serverToolName),
      `${serverToolName} (${serverName} MCP Server)`,
      description,
      Kind.Other,
      parameterSchema,
      true, // isOutputMarkdown
      false, // canUpdateOutput,
      messageBus,
      extensionName,
      extensionId,
    );
  }

  getFullyQualifiedPrefix(): string {
    return `${this.serverName}__`;
  }

  asFullyQualifiedTool(): DiscoveredMCPTool {
    return new DiscoveredMCPTool(
      this.mcpTool,
      this.serverName,
      this.serverToolName,
      this.description,
      this.parameterSchema,
      this.trust,
      `${this.getFullyQualifiedPrefix()}${this.serverToolName}`,
      this.cliConfig,
      this.extensionName,
      this.extensionId,
      this.messageBus,
    );
  }

  protected createInvocation(
    params: ToolParams,
    _messageBus?: MessageBus,
    _toolName?: string,
    _displayName?: string,
  ): ToolInvocation<ToolParams, ToolResult> {
    return new DiscoveredMCPToolInvocation(
      this.mcpTool,
      this.serverName,
      this.serverToolName,
      this.displayName,
      this.trust,
      params,
      this.cliConfig,
      _messageBus,
    );
  }
}

function transformTextBlock(block: McpTextBlock): Part {
  return { text: block.text };
}

function transformImageAudioBlock(
  block: McpMediaBlock,
  toolName: string,
): Part[] {
  return [
    {
      text: `[Tool '${toolName}' provided the following ${
        block.type
      } data with mime-type: ${block.mimeType}]`,
    },
    {
      inlineData: {
        mimeType: block.mimeType,
        data: block.data,
      },
    },
  ];
}

function transformResourceBlock(
  block: McpResourceBlock,
  toolName: string,
): Part | Part[] | null {
  const resource = block.resource;
  if (resource?.text) {
    return { text: resource.text };
  }
  if (resource?.blob) {
    const mimeType = resource.mimeType || 'application/octet-stream';
    return [
      {
        text: `[Tool '${toolName}' provided the following embedded resource with mime-type: ${mimeType}]`,
      },
      {
        inlineData: {
          mimeType,
          data: resource.blob,
        },
      },
    ];
  }
  return null;
}

function transformResourceLinkBlock(block: McpResourceLinkBlock): Part {
  return {
    text: `Resource Link: ${block.title || block.name} at ${block.uri}`,
  };
}

/**
 * Transforms the raw MCP content blocks from the SDK response into a
 * standard GenAI Part array.
 * @param sdkResponse The raw Part[] array from `mcpTool.callTool()`.
 * @returns A clean Part[] array ready for the scheduler.
 */
function transformMcpContentToParts(sdkResponse: Part[]): Part[] {
  const funcResponse = sdkResponse?.[0]?.functionResponse;
  const mcpContent = funcResponse?.response?.['content'] as McpContentBlock[];
  const toolName = funcResponse?.name || 'unknown tool';

  if (!Array.isArray(mcpContent)) {
    const responseStructure = funcResponse?.response
      ? JSON.stringify(funcResponse.response, null, 2)
      : 'No response object';
    const errorMsg = funcResponse
      ? `[Error: MCP tool '${toolName}' returned a response without a valid 'content' array.\n\n` +
        `The response may be malformed or the tool may not be following the MCP protocol correctly.\n\n` +
        `Expected structure: { content: [ { type: 'text', text: '...' } ] }\n` +
        `Actual response structure:\n${responseStructure}\n\n` +
        `Debugging tips:\n` +
        `- Check the MCP server implementation for '${toolName}'\n` +
        `- Verify the tool returns a 'content' array in the response\n` +
        `- Ensure the MCP server follows the Model Context Protocol specification\n` +
        `- Review server logs for additional error details]`
      : '[Error: Could not parse tool response - no function response found in the MCP tool output.\n\n' +
        `Raw SDK response: ${JSON.stringify(sdkResponse, null, 2)}\n\n` +
        `Debugging tips:\n` +
        `- This usually indicates the MCP server crashed or failed to respond\n` +
        `- Check the MCP server process is running\n` +
        `- Review server logs and stderr output\n` +
        `- Verify the server configuration in gemini-extension.json]`;
    debugLogger.warn(
      `MCP tool response parsing failed for '${toolName}':`,
      sdkResponse,
    );
    return [{ text: errorMsg }];
  }

  if (mcpContent.length === 0) {
    debugLogger.warn(
      `MCP tool '${toolName}' returned empty content array. Tool executed but provided no output.`,
    );
    return [
      {
        text:
          `[Warning: MCP tool '${toolName}' returned an empty response.\n\n` +
          `The tool executed successfully but did not provide any content.\n\n` +
          `Possible reasons:\n` +
          `- The tool completed successfully with no data to return (this may be expected behavior)\n` +
          `- The tool encountered an issue but did not report an error properly\n` +
          `- The tool's implementation may need to return content even for empty results\n` +
          `- The tool parameters may not have matched any data\n\n` +
          `Debugging tips:\n` +
          `- Check if this is expected behavior for the tool\n` +
          `- Review the tool's documentation for valid input parameters\n` +
          `- Examine the MCP server logs for warnings or info messages\n` +
          `- Verify the tool is configured correctly in your extension]`,
      },
    ];
  }

  const transformed = mcpContent.flatMap(
    (block: McpContentBlock): Part | Part[] | null => {
      switch (block.type) {
        case 'text':
          return transformTextBlock(block);
        case 'image':
        case 'audio':
          return transformImageAudioBlock(block, toolName);
        case 'resource':
          return transformResourceBlock(block, toolName);
        case 'resource_link':
          return transformResourceLinkBlock(block);
        default:
          return null;
      }
    },
  );

  return transformed.filter((part): part is Part => part !== null);
}

/**
 * Processes the raw response from the MCP tool to generate a clean,
 * human-readable string for display in the CLI. It summarizes non-text
 * content and presents text directly. Provides comprehensive diagnostic
 * information for troubleshooting.
 *
 * @param rawResponse The raw Part[] array from the GenAI SDK.
 * @returns A formatted string representing the tool's output with full diagnostic details.
 */
function getStringifiedResultForDisplay(rawResponse: Part[]): string {
  const funcResponse = rawResponse?.[0]?.functionResponse;
  const mcpContent = funcResponse?.response?.['content'] as McpContentBlock[];
  const toolName = funcResponse?.name || 'unknown tool';

  if (!Array.isArray(mcpContent)) {
    const responseStructure = funcResponse?.response
      ? JSON.stringify(funcResponse.response, null, 2)
      : 'No response object available';
    const rawResponseStr = JSON.stringify(rawResponse, null, 2);

    const errorPrefix = funcResponse
      ? `❌ Error: MCP tool '${toolName}' returned a malformed response.\n\n` +
        `📋 Expected Response Structure:\n` +
        `{\n  content: [\n    { type: 'text', text: 'your content here' },\n    // or other content types\n  ]\n}\n\n` +
        `📦 Actual Response Structure:\n${responseStructure}\n\n`
      : `❌ Error: No function response found in MCP tool output.\n\n` +
        `This indicates the MCP server failed to execute or respond.\n\n`;

    return (
      errorPrefix +
      `🔍 Full Raw Response (for debugging):\n` +
      `\`\`\`json\n${rawResponseStr}\n\`\`\`\n\n` +
      `💡 Troubleshooting Steps:\n` +
      `1. Verify the MCP server is running and accessible\n` +
      `2. Check server logs for errors or warnings\n` +
      `3. Ensure the tool follows the MCP protocol specification\n` +
      `4. Validate the extension configuration in gemini-extension.json\n` +
      `5. Try restarting the extension or MCP server\n\n` +
      `📚 Resources:\n` +
      `- MCP Protocol Spec: https://modelcontextprotocol.io/specification\n` +
      `- Extension Docs: Check your extension's README for configuration details`
    );
  }

  if (mcpContent.length === 0) {
    return (
      `⚠️  Warning: MCP tool '${toolName}' returned an empty response.\n\n` +
      `The tool executed successfully but did not provide any output.\n\n` +
      `📊 Response Analysis:\n` +
      `- Response structure: Valid (contains 'content' array)\n` +
      `- Content items: 0 (empty array)\n` +
      `- Execution status: Success (no errors reported)\n\n` +
      `🤔 Possible Reasons:\n` +
      `✓ The tool completed successfully with no data to return (expected behavior)\n` +
      `✓ The query/parameters didn't match any data\n` +
      `✓ The tool is designed to return empty results in some cases\n` +
      `⚠️  The tool encountered an issue but didn't report an error\n` +
      `⚠️  The tool implementation may need updating\n\n` +
      `💡 Next Steps:\n` +
      `1. Review the tool's documentation for expected behavior\n` +
      `2. Check if the input parameters are correct\n` +
      `3. Examine MCP server logs for additional context\n` +
      `4. Try different parameters or queries\n` +
      `5. Contact the extension maintainer if issue persists\n\n` +
      `🔧 Debug Information:\n` +
      `- Tool: ${toolName}\n` +
      `- Response content array length: 0\n` +
      `- Full response: ${JSON.stringify(rawResponse, null, 2)}`
    );
  }

  const displayParts = mcpContent.map((block: McpContentBlock): string => {
    switch (block.type) {
      case 'text':
        return block.text;
      case 'image':
        return `[Image: ${block.mimeType}]`;
      case 'audio':
        return `[Audio: ${block.mimeType}]`;
      case 'resource_link':
        return `[Link to ${block.title || block.name}: ${block.uri}]`;
      case 'resource':
        if (block.resource?.text) {
          return block.resource.text;
        }
        return `[Embedded Resource: ${
          block.resource?.mimeType || 'unknown type'
        }]`;
      default:
        return `[Unknown content type: ${(block as { type: string }).type}]`;
    }
  });

  return displayParts.join('\n');
}

/** Visible for testing */
export function generateValidName(name: string) {
  // Replace invalid characters (based on 400 error message from Gemini API) with underscores
  let validToolname = name.replace(/[^a-zA-Z0-9_.-]/g, '_');

  // If longer than 63 characters, replace middle with '___'
  // (Gemini API says max length 64, but actual limit seems to be 63)
  if (validToolname.length > 63) {
    validToolname =
      validToolname.slice(0, 28) + '___' + validToolname.slice(-32);
  }
  return validToolname;
}
