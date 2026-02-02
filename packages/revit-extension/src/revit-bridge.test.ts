/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RevitBridge } from './revit-bridge.js';

vi.mock('ws', async () => {
  const { EventEmitter } = await import('node:events');

  class MockWebSocket extends EventEmitter {
    readyState = 1;
    send = vi.fn();
    close = vi.fn();

    constructor() {
      super();
      setTimeout(() => {
        this.emit('open');
      }, 10);
    }
  }

  return {
    default: MockWebSocket,
  };
});

describe('RevitBridge', () => {
  let bridge: RevitBridge;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    if (bridge) {
      await bridge.disconnect();
    }
  });

  describe('Connection Status', () => {
    it('should return connection status', () => {
      bridge = new RevitBridge();
      const status = bridge.getConnectionStatus();

      expect(status).toHaveProperty('connected');
      expect(status).toHaveProperty('projectLoaded');
      expect(typeof status.connected).toBe('boolean');
      expect(typeof status.projectLoaded).toBe('boolean');
    });

    it('should initially be disconnected', () => {
      bridge = new RevitBridge();
      const status = bridge.getConnectionStatus();

      expect(status.connected).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when not connected', async () => {
      bridge = new RevitBridge();

      await expect(bridge.getElements({ category: 'Walls' })).rejects.toThrow(
        'Not connected to Revit',
      );
    });

    it('should provide helpful error message', async () => {
      bridge = new RevitBridge();

      try {
        await bridge.getElements({ category: 'Walls' });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        if (error instanceof Error) {
          expect(error.message).toContain('Not connected to Revit');
          expect(error.message).toContain('add-in');
        }
      }
    });
  });

  describe('Disconnect', () => {
    it('should disconnect cleanly', async () => {
      bridge = new RevitBridge();
      await expect(bridge.disconnect()).resolves.not.toThrow();
    });

    it('should handle disconnect when already disconnected', async () => {
      bridge = new RevitBridge();
      await bridge.disconnect();
      await expect(bridge.disconnect()).resolves.not.toThrow();
    });
  });

  describe('Input Validation', () => {
    it('should accept valid GetElementsInput', async () => {
      bridge = new RevitBridge();

      const validInput = {
        category: 'Walls' as const,
        limit: 50,
      };

      try {
        await bridge.getElements(validInput);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        if (error instanceof Error) {
          expect(error.message).toContain('Not connected');
        }
      }
    });

    it('should accept valid CreateElementInput', async () => {
      bridge = new RevitBridge();

      const validInput = {
        category: 'Walls' as const,
        family: 'Basic Wall',
        type: 'Exterior - Brick',
        location: { x: 0, y: 0, z: 0 },
      };

      try {
        await bridge.createElement(validInput);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        if (error instanceof Error) {
          expect(error.message).toContain('Not connected');
        }
      }
    });
  });
});
