import { z } from "zod";

// Make fields nullable where appropriate
export const ApiUser = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  organizationId: z.string(),
  imageUrl: z.string().nullable().optional(),
  primaryEmail: z.string().email().nullable().optional(),
  jobDescription: z.string().nullable().optional(),
  onboarded: z.boolean().default(false),
  isOrganizationAdmin: z.boolean().default(false),
  isSuperUser: z.boolean().default(false),
  isSuperUserOnly: z.boolean().default(false).optional(),
  tourCompleted: z.boolean().default(false),
  company: z.string().nullable().optional(),
  roles: z.enum(["USER", "TEACHER"]).array().default([]),
  hasPayloadKeySet: z.boolean().optional(),
  acceptedGuidelines: z.boolean().optional(),
});

export type ApiUser = z.infer<typeof ApiUser>;

export const UpdateApiUser = ApiUser.partial().omit({
  id: true,
  isOrganizationAdmin: true,
  isSuperUserOnly: true,
  hasPayloadKeySet: true,
  company: true,
  roles: true,
});

export const ApiOrganizationUser = ApiUser.extend({
  lastLogin: z.string().nullable(),
  lastActive: z.string().nullable(),
  totalMessages: z.number(),
});

export type ApiOrganizationUser = z.infer<typeof ApiOrganizationUser>;

export const ApiUpdatePayloadApiKey = z.object({
  payloadApiKey: z.string().uuid(),
});

export type ApiUpdatePayloadApiKey = z.infer<typeof ApiUpdatePayloadApiKey>;
