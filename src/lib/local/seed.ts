import { ApiOrganization } from "@apiTypes/Organization";
import type { ApiUser } from "@apiTypes/User";
import { DEFAULT_ENABLED_MODELS, DEFAULT_ORGANIZATION_MODEL } from "@shared/ai/llmMeta";
import type { Department } from "@shared/api/organization/departmentTypes";
import type { Workflow } from "@shared/api/workflow/workflowTypes";

const LOCAL_DEMO_WORKFLOW: Workflow = {
  id: "demo",
  name: "Demo Workflow",
  createdAt: new Date(),
  updatedAt: new Date(),
  index: 0,
  departmentId: "personal",
  description: "Demo workflow for local edition.",
  steps: [
    {
      id: "step1",
      order: 0,
      promptTemplate: "Hello from the demo workflow.",
      modelOverride: null,
    },
  ],
};

export const DEV_ORG_ID = "org_cm8yflh26064xmw01zbalts9c";

export const LOCAL_ORGANIZATION = ApiOrganization.parse({
  id: DEV_ORG_ID,
  name: "My Enterprise",
  domain: ["localhost"],
  isAcademyOnly: false,
  customPrimaryColor: "#4F46E5",
  defaultModel: DEFAULT_ORGANIZATION_MODEL,
  tenantId: "550e8400-e29b-41d4-a716-446655440000",
  defaultWorkshopId: "",
  logoUrl: "",
  avatarUrl: "",
  phaseStatus: "ok",
  customTitle: "KathaGPT",
  banners: [],
  phase: "NORMAL",
  phaseStartDate: new Date(),
  phaseEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
});

export const LOCAL_USER: ApiUser = {
  id: "user_local",
  firstName: "John",
  lastName: "Doe",
  email: "user@kathagpt.local",
  organizationId: DEV_ORG_ID,
  isOrganizationAdmin: true,
  tourCompleted: true,
  roles: ["USER"],
  jobDescription: "Developer",
  onboarded: true,
  isSuperUser: false,
  company: "My Enterprise",
  imageUrl: null,
  primaryEmail: "user@kathagpt.local",
  isSuperUserOnly: false,
  acceptedGuidelines: true,
};

export const LOCAL_PRODUCT_CONFIG = {
  imageGeneration: true,
  meetingSummarizer: true,
  meetingTranscription: true,
  personalAssistant: true,
  meetingTools: true,
  documentTranslator: true,
  textTranslator: true,
  sonar: true,
  academy: false,
  academyOnly: false,
  enableRag: false,
  enableRagAcademy: false,
} as const;

export const LOCAL_DEPARTMENTS: Department[] = [
  {
    id: "personal",
    name: "Personal",
    workflows: [LOCAL_DEMO_WORKFLOW],
    writePermission: true,
    isPersonal: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const LOCAL_ENABLED_MODELS = [...DEFAULT_ENABLED_MODELS];
