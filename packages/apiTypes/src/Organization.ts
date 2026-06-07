//  packages/apiTypes/src/Organization
import * as z from "zod";
import { ModelOverride } from "@shared/api/chat/chatTypes";

export const ApiOrganization = z.object({
  id: z.string(),
  name: z.string(),
  domain: z.array(z.string()),
  isAcademyOnly: z.boolean(),
  customPrimaryColor: z.string(),
  defaultModel: ModelOverride,
  tenantId: z.string(),
  defaultWorkshopId: z.string(),
  logoUrl: z.string(),
  avatarUrl: z.string(),
  // Add missing fields
  customTitle: z.string().optional(),
  banners: z.array(z.object({
    id: z.string(),
    content: z.string(),
    type: z.enum(["danger", "warning", "success"])
  })).optional(),

    // Add phase fields
  phase: z.enum(["TRIAL", "NORMAL", "CREDIT"]),
  phaseStartDate: z.coerce.date().optional(),
  phaseEndDate: z.coerce.date().optional(),
  phaseStatus: z.enum(["ok", "expired", "creditsExhausted"]),
  nonEuWarningSkippable: z.boolean().optional(),
});


export type ApiOrganization = z.infer<typeof ApiOrganization>;

export const ApiPatchOrganization = ApiOrganization.omit({
  id: true,
  tenantId: true,
})
  .partial()
  .refine((data) => !(data.domain && data.domain.length > 3), {
    message: "Maximum 3 domains allowed",
  });

export type ApiPatchOrganization = z.infer<typeof ApiPatchOrganization>;
