/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import WebSocket from 'ws';
import {
  type RevitElement,
  type RevitProjectInfo,
  type RevitConnectionStatus,
  type GetElementsInput,
  type CreateElementInput,
  type ModifyElementInput,
  type DeleteElementInput,
  type RevitBridgeMessage,
} from './types.js';

export class RevitBridge {
  private ws: WebSocket | null = null;
  private connectionStatus: RevitConnectionStatus = {
    connected: false,
    projectLoaded: false,
  };
  private messageHandlers = new Map<string, (data: unknown) => void>();
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 2000;

  constructor(private readonly port: number = 8080) {
    this.connect();
  }

  private connect(): void {
    try {
      this.ws = new WebSocket(`ws://localhost:${this.port}`);

      this.ws.on('open', () => {
        console.log('Connected to Revit bridge');
        this.connectionStatus.connected = true;
        this.reconnectAttempts = 0;
      });

      this.ws.on('message', (data: Buffer) => {
        try {
          const message: RevitBridgeMessage = JSON.parse(data.toString());
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });

      this.ws.on('close', () => {
        console.log('Disconnected from Revit bridge');
        this.connectionStatus.connected = false;
        this.attemptReconnect();
      });

      this.ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        if (!this.connectionStatus.connected) {
          this.attemptReconnect();
        }
      });
    } catch (error) {
      console.error('Failed to connect to Revit bridge:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        'Max reconnection attempts reached. Please ensure Revit add-in is running.',
      );
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`,
    );

    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  private handleMessage(message: RevitBridgeMessage): void {
    const handler = this.messageHandlers.get(message.id);
    if (handler) {
      handler(message.data);
      this.messageHandlers.delete(message.id);
    }

    if (message.type === 'status') {
      this.updateConnectionStatus(message.data as RevitConnectionStatus);
    }
  }

  private updateConnectionStatus(status: Partial<RevitConnectionStatus>): void {
    this.connectionStatus = { ...this.connectionStatus, ...status };
  }

  private async sendCommand<T>(
    command: string,
    parameters?: unknown,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        if (command === 'get_connection_status') {
          resolve(this.connectionStatus as T);
          return;
        }

        reject(
          new Error(
            'Not connected to Revit. Please ensure the Revit add-in is installed and running, and that a project is open in Revit.',
          ),
        );
        return;
      }

      const messageId = `${command}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const message: RevitBridgeMessage = {
        type: 'command',
        id: messageId,
        data: { command, parameters },
        timestamp: Date.now(),
      };

      const timeout = setTimeout(() => {
        this.messageHandlers.delete(messageId);
        reject(new Error('Request timeout'));
      }, 30000);

      this.messageHandlers.set(messageId, (data) => {
        clearTimeout(timeout);
        resolve(data as T);
      });

      this.ws.send(JSON.stringify(message));
    });
  }

  async getElements(input: GetElementsInput): Promise<RevitElement[]> {
    const elements = await this.sendCommand<RevitElement[]>(
      'get_elements',
      input,
    );
    return elements;
  }

  async getElementById(elementId: string): Promise<RevitElement> {
    const element = await this.sendCommand<RevitElement>('get_element_by_id', {
      elementId,
    });
    return element;
  }

  async createElement(input: CreateElementInput): Promise<RevitElement> {
    const element = await this.sendCommand<RevitElement>(
      'create_element',
      input,
    );
    return element;
  }

  async modifyElement(input: ModifyElementInput): Promise<RevitElement> {
    const element = await this.sendCommand<RevitElement>(
      'modify_element',
      input,
    );
    return element;
  }

  async deleteElement(input: DeleteElementInput): Promise<void> {
    await this.sendCommand<void>('delete_element', input);
  }

  async getProjectInfo(): Promise<RevitProjectInfo> {
    const projectInfo =
      await this.sendCommand<RevitProjectInfo>('get_project_info');
    return projectInfo;
  }

  getConnectionStatus(): RevitConnectionStatus {
    return this.connectionStatus;
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
