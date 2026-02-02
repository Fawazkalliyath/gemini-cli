/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import {
  RevitElementCategorySchema,
  RevitParameterSchema,
  RevitElementSchema,
  GetElementsInputSchema,
  CreateElementInputSchema,
  ModifyElementInputSchema,
  DeleteElementInputSchema,
} from './types.js';

describe('Type Validation', () => {
  describe('RevitElementCategorySchema', () => {
    it('should accept valid categories', () => {
      const validCategories = ['Walls', 'Doors', 'Windows', 'Floors', 'Roofs'];

      validCategories.forEach((category) => {
        const result = RevitElementCategorySchema.safeParse(category);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid categories', () => {
      const result = RevitElementCategorySchema.safeParse('InvalidCategory');
      expect(result.success).toBe(false);
    });
  });

  describe('RevitParameterSchema', () => {
    it('should accept valid parameters', () => {
      const validParam = {
        name: 'Height',
        value: 10,
        type: 'Number',
        isReadOnly: false,
      };

      const result = RevitParameterSchema.safeParse(validParam);
      expect(result.success).toBe(true);
    });

    it('should accept parameters without optional fields', () => {
      const minimalParam = {
        name: 'Height',
        value: 10,
        type: 'Number',
      };

      const result = RevitParameterSchema.safeParse(minimalParam);
      expect(result.success).toBe(true);
    });

    it('should reject parameters with invalid type', () => {
      const invalidParam = {
        name: 'Height',
        value: 10,
        type: 'InvalidType',
      };

      const result = RevitParameterSchema.safeParse(invalidParam);
      expect(result.success).toBe(false);
    });
  });

  describe('RevitElementSchema', () => {
    it('should accept valid elements', () => {
      const validElement = {
        id: 'elem-123',
        name: 'Basic Wall',
        category: 'Walls',
        family: 'Basic Wall',
        type: 'Exterior - Brick',
        parameters: [
          {
            name: 'Height',
            value: 10,
            type: 'Length',
          },
        ],
        level: 'Level 1',
        location: {
          x: 0,
          y: 0,
          z: 0,
        },
      };

      const result = RevitElementSchema.safeParse(validElement);
      expect(result.success).toBe(true);
    });

    it('should accept minimal valid elements', () => {
      const minimalElement = {
        id: 'elem-123',
        name: 'Basic Wall',
        category: 'Walls',
      };

      const result = RevitElementSchema.safeParse(minimalElement);
      expect(result.success).toBe(true);
    });
  });

  describe('GetElementsInputSchema', () => {
    it('should accept valid input', () => {
      const validInput = {
        category: 'Walls',
        family: 'Basic Wall',
        level: 'Level 1',
        limit: 50,
      };

      const result = GetElementsInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should apply default limit', () => {
      const input = { category: 'Walls' };
      const result = GetElementsInputSchema.parse(input);
      expect(result.limit).toBe(100);
    });

    it('should reject limit outside valid range', () => {
      const tooSmall = { limit: 0 };
      expect(GetElementsInputSchema.safeParse(tooSmall).success).toBe(false);

      const tooLarge = { limit: 1001 };
      expect(GetElementsInputSchema.safeParse(tooLarge).success).toBe(false);
    });

    it('should accept empty input', () => {
      const result = GetElementsInputSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('CreateElementInputSchema', () => {
    it('should accept valid create input', () => {
      const validInput = {
        category: 'Walls',
        family: 'Basic Wall',
        type: 'Exterior - Brick',
        location: { x: 0, y: 0, z: 0 },
      };

      const result = CreateElementInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should default confirmationRequired to true', () => {
      const input = {
        category: 'Walls',
        family: 'Basic Wall',
        type: 'Exterior - Brick',
        location: { x: 0, y: 0, z: 0 },
      };

      const result = CreateElementInputSchema.parse(input);
      expect(result.confirmationRequired).toBe(true);
    });

    it('should reject input missing required fields', () => {
      const missingCategory = {
        family: 'Basic Wall',
        type: 'Exterior - Brick',
        location: { x: 0, y: 0, z: 0 },
      };

      const result = CreateElementInputSchema.safeParse(missingCategory);
      expect(result.success).toBe(false);
    });
  });

  describe('ModifyElementInputSchema', () => {
    it('should accept valid modify input', () => {
      const validInput = {
        elementId: 'elem-123',
        parameters: [
          {
            name: 'Height',
            value: 12,
            type: 'Length',
          },
        ],
      };

      const result = ModifyElementInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should default confirmationRequired to true', () => {
      const input = {
        elementId: 'elem-123',
        parameters: [
          {
            name: 'Height',
            value: 12,
            type: 'Length',
          },
        ],
      };

      const result = ModifyElementInputSchema.parse(input);
      expect(result.confirmationRequired).toBe(true);
    });
  });

  describe('DeleteElementInputSchema', () => {
    it('should accept valid delete input', () => {
      const validInput = {
        elementId: 'elem-123',
      };

      const result = DeleteElementInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should default confirmationRequired to true', () => {
      const input = {
        elementId: 'elem-123',
      };

      const result = DeleteElementInputSchema.parse(input);
      expect(result.confirmationRequired).toBe(true);
    });

    it('should allow confirmationRequired to be false', () => {
      const input = {
        elementId: 'elem-123',
        confirmationRequired: false,
      };

      const result = DeleteElementInputSchema.parse(input);
      expect(result.confirmationRequired).toBe(false);
    });
  });
});
