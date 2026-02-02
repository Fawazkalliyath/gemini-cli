/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

export const RevitElementCategorySchema = z.enum([
  'Walls',
  'Doors',
  'Windows',
  'Floors',
  'Roofs',
  'Columns',
  'Beams',
  'Furniture',
  'Rooms',
  'Spaces',
  'MEP',
  'Structural',
  'Other',
]);

export type RevitElementCategory = z.infer<typeof RevitElementCategorySchema>;

export const RevitParameterSchema = z.object({
  name: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]),
  type: z.enum(['Text', 'Number', 'Boolean', 'Length', 'Area', 'Volume']),
  isReadOnly: z.boolean().optional(),
});

export type RevitParameter = z.infer<typeof RevitParameterSchema>;

export const RevitElementSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: RevitElementCategorySchema,
  family: z.string().optional(),
  type: z.string().optional(),
  parameters: z.array(RevitParameterSchema).optional(),
  level: z.string().optional(),
  location: z
    .object({
      x: z.number(),
      y: z.number(),
      z: z.number(),
    })
    .optional(),
});

export type RevitElement = z.infer<typeof RevitElementSchema>;

export const RevitProjectInfoSchema = z.object({
  name: z.string(),
  author: z.string().optional(),
  buildingName: z.string().optional(),
  clientName: z.string().optional(),
  projectNumber: z.string().optional(),
  projectAddress: z.string().optional(),
  issueDate: z.string().optional(),
});

export type RevitProjectInfo = z.infer<typeof RevitProjectInfoSchema>;

export const GetElementsInputSchema = z.object({
  category: RevitElementCategorySchema.optional(),
  family: z.string().optional(),
  level: z.string().optional(),
  limit: z.number().min(1).max(1000).default(100),
});

export type GetElementsInput = z.infer<typeof GetElementsInputSchema>;

export const CreateElementInputSchema = z.object({
  category: RevitElementCategorySchema,
  family: z.string(),
  type: z.string(),
  location: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }),
  parameters: z.array(RevitParameterSchema).optional(),
  level: z.string().optional(),
  confirmationRequired: z.boolean().default(true),
});

export type CreateElementInput = z.infer<typeof CreateElementInputSchema>;

export const ModifyElementInputSchema = z.object({
  elementId: z.string(),
  parameters: z.array(RevitParameterSchema),
  confirmationRequired: z.boolean().default(true),
});

export type ModifyElementInput = z.infer<typeof ModifyElementInputSchema>;

export const DeleteElementInputSchema = z.object({
  elementId: z.string(),
  confirmationRequired: z.boolean().default(true),
});

export type DeleteElementInput = z.infer<typeof DeleteElementInputSchema>;

export const RevitCommandSchema = z.object({
  command: z.string(),
  parameters: z.record(z.unknown()).optional(),
  requiresConfirmation: z.boolean().default(false),
});

export type RevitCommand = z.infer<typeof RevitCommandSchema>;

export interface RevitBridgeMessage {
  type: 'command' | 'response' | 'error' | 'status';
  id: string;
  data: unknown;
  timestamp: number;
}

export interface RevitConnectionStatus {
  connected: boolean;
  revitVersion?: string;
  projectLoaded: boolean;
  projectName?: string;
}
