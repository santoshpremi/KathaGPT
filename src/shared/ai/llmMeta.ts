//backend/src/ai/llmMeta.ts
import z from "zod";
type LlmEnv = Record<string, string | undefined>;

/**
 * The margin to add to the price of text generation as a decimal factor.
 * If we want a margin of 20%, this should be 1.20
 */
export const CREDIT_MARGIN_FACTOR = 1.2;

export const DEFAULT_ORGANIZATION_MODEL = "gpt-4o-mini";

export const DEFAULT_ENABLED_MODELS: LlmName[] = [
  "gpt-4o",
  "gpt-4o-mini",
  "sonar",
  "claude-3-7-sonnet",
  "gemini-1.5-pro",
];

/**
 * The developer of LLMs. This IS NOT the same as the provider of the API. Will be used for Icon display and meta information display
 */
export type AIProviders =
  | "OpenAI"
  | "Perplexity"
  | "Microsoft"
  | "Google"
  | "KathaGPT"
  | "Nebius";

/**
 * A function that returns the API configuration for a given environment
 */
type AiApi = (e: LlmEnv) => {
  endpoint: string;
  apiKey: string;
  apiVersion?: string;
  allowMetadata?: boolean;
};

const LITE_LLM_API: AiApi = (e) => ({
  endpoint: e.DEV_LITELLM_BASE_URL ?? "",
  apiKey: e.LITELLM_API_KEY ?? "",
  allowMetadata: true,
});

const PERPLEXITY_API: AiApi = (e) => ({
  endpoint: "https://api.perplexity.ai",
  apiKey: e.PERPLEXITY_API_KEY!,
});

const GPT_4O_MINI_API: AiApi = (e) => {
  if (e.AZURE_API_GPT4O_MINI_ENDPOINT && e.AZURE_API_GPT4O_MINI_API_KEY) {
    return {
      endpoint: e.AZURE_API_GPT4O_MINI_ENDPOINT,
      apiKey: e.AZURE_API_GPT4O_MINI_API_KEY,
      apiVersion: "2024-07-01-preview",
    };
  } else {
    return LITE_LLM_API(e);
  }
};

const GPT_4O_API: AiApi = (e) => {
  if (e.AZURE_API_GPT4O_ENDPOINT && e.AZURE_API_GPT4O_API_KEY) {
    return {
      endpoint: e.AZURE_API_GPT4O_ENDPOINT,
      apiKey: e.AZURE_API_GPT4O_API_KEY,
      apiVersion: "2024-07-01-preview",
    };
  } else {
    return LITE_LLM_API(e);
  }
};

export type LlmMetaData = {
  name: string;
  provider: AIProviders;
  infoUrl: string;
  online?: boolean;
  hostingLocation: "EU" | "US";
  quality: number;
  speed: number;
  allowChat: boolean;
  citationsSupported?: boolean;
  capabilities: string[];
  contextWindow: number;
  maxOutputTokens: number;
  /**
   * The price in Euro(!) per `unit` tokens (either per thousand or per million)
   */
  price: {
    inputTokens: number;
    outputTokens: number;
    unit: "perThousand" | "perMillion";
  };
  api: AiApi;
  additionalCompletionOptions?: Record<string, unknown>;
  includeInHealthCheck?: boolean;
};

const _LLM_META = {
  sonar: {
    name: "Perplexity Online",
    infoUrl: "https://www.perplexity.ai/hub/blog/introducing-pplx-online-llms",
    hostingLocation: "US",
    online: true,
    provider: "Perplexity",
    quality: 3,
    speed: 4,
    capabilities: ["Research", "Search", "Summarization"],
    contextWindow: 128_000,
    maxOutputTokens: 4096,
    allowChat: true,
    price: {
      // Source: https://docs.perplexity.ai/guides/pricing
      // Includes $5 per 1000 requests: 1 request is on average 500 tokens, so 1000 requests are 500_000 tokens.
      // This means an additional 10$ for 1 million tokens
      inputTokens: 11, // ($5.00 / 0.5M tokens) * 2 + ($1.00 / 1M tokens) = 11$ / 1M tokens
      outputTokens: 1, // $1.00 / 1M tokens
      unit: "perMillion",
    },
    citationsSupported: true,
    api: PERPLEXITY_API,
  },

  "sonar-deep-research": {
    name: "Perplexity Deep Research",
    infoUrl:
      "https://www.perplexity.ai/hub/blog/introducing-perplexity-deep-research",
    hostingLocation: "US",
    online: true,
    provider: "Perplexity",
    quality: 4,
    speed: 1,
    capabilities: ["Research", "Search", "Summarization"], // TODO: double check
    contextWindow: 128_000,
    maxOutputTokens: 4096, // TODO: double check
    allowChat: false,
    price: {
      // Source: https://docs.perplexity.ai/guides/pricing
      // Includes $5 per 1000 requests: 1 request is on average 500 tokens, so 1000 requests are 500_000 tokens.
      // This means an additional 10$ for 1 million tokens
      inputTokens: 12, // ($5.00 / 0.5M tokens) * 2 + ($2.00 / 1M tokens) = 12$ / 1M tokens
      outputTokens: 8, // $8.00 / 1M tokens
      unit: "perMillion",
    },
    citationsSupported: true,
    api: PERPLEXITY_API,
  },

  // OpenAI
  // Pricing: https://azure.microsoft.com/de-de/pricing/details/cognitive-services/openai-service/
  // (Region is sweden-central)
  "gpt-4o-mini": {
    name: "GPT-4o Mini",
    infoUrl: "https://platform.openai.com/docs/models/gpt-4o-mini",
    hostingLocation: "EU",
    provider: "Microsoft",
    quality: 3,
    speed: 4,
    capabilities: ["Short Drafts", "General Chat", "Medium Complexity"],
    contextWindow: 128_000,
    maxOutputTokens: 16384,
    allowChat: true,
    price: {
      inputTokens: 0.00014,
      outputTokens: 0.0006,
      unit: "perThousand",
    },
    api: GPT_4O_MINI_API,
  },
  "gpt-4o": {
    name: "GPT-4o",
    infoUrl: "https://platform.openai.com/docs/models/gpt-4o",
    hostingLocation: "EU",
    provider: "Microsoft",
    quality: 5,
    speed: 2,
    capabilities: [
      "Brainstorming",
      "Strategies",
      "Long Responses",
      "Complex Reasoning",
      "Technical Writing",
    ],
    contextWindow: 128_000,
    maxOutputTokens: 2048,
    allowChat: true,
    price: {
      inputTokens: 2.46273,
      outputTokens: 9.8509,
      unit: "perMillion",
    },
    api: GPT_4O_API,
  },

  // OpenAI US
  // Pricing: https://openai.com/api/pricing/
  "o1-us": {
    name: "o1",
    infoUrl: "https://openai.com/o1/",
    hostingLocation: "US",
    provider: "OpenAI",
    quality: 5,
    speed: 1,
    capabilities: ["Logic", "Math", "Programming", "Problem Solving"],
    contextWindow: 200_000,
    allowChat: true,
    price: {
      inputTokens: 15,
      outputTokens: 60,
      unit: "perMillion",
    },
    api: LITE_LLM_API,
    additionalCompletionOptions: {
      // Completions are very slow, so our default timeout of 10s is not enough
      timeout: 300, // seconds
    },
    includeInHealthCheck: false,
    maxOutputTokens: 100_000,
  },

  "o3-mini": {
    name: "o3-mini",
    infoUrl: "https://openai.com/index/openai-o3-mini/",
    hostingLocation: "EU",
    provider: "Microsoft",
    quality: 4,
    speed: 4,
    capabilities: ["Programming", "Data Analysis", "Problem Solving", "Math"],
    contextWindow: 200_000,
    allowChat: true,
    price: {
      inputTokens: 1.1,
      outputTokens: 4.4,
      unit: "perMillion",
    },
    api: LITE_LLM_API,
    additionalCompletionOptions: {
      // Completions are very slow, so our default timeout of 10s is not enough
      timeout: 300, // seconds
    },
    includeInHealthCheck: false,
    maxOutputTokens: 100_000,
  },

  // Anthropic

  // Model Card: https://console.cloud.google.com/vertex-ai/publishers/anthropic/model-garden/claude-3-7-sonnet
  "claude-3-7-sonnet": {
    name: "Claude 3.7 Sonnet",
    infoUrl: "https://www.anthropic.com/claude/sonnet",
    hostingLocation: "EU",
    provider: "Google",
    quality: 5,
    speed: 4,
    capabilities: ["Programming", "Complex Queries", "Technical Writing"],
    contextWindow: 200_000,
    maxOutputTokens: 128_000,
    allowChat: true,
    price: {
      // Pricing: https://cloud.google.com/vertex-ai/generative-ai/pricing#claude-models
      inputTokens: 3,
      outputTokens: 15,
      unit: "perMillion",
    },
    api: LITE_LLM_API,
  },

  "claude-3-7-sonnet-thinking": {
    name: "Claude 3.7 Sonnet Thinking",
    infoUrl: "https://www.anthropic.com/claude",
    hostingLocation: "EU",
    provider: "Google",
    quality: 5,
    speed: 4,
    capabilities: [
      "Reasoning",
      "Programming",
      "Complex Queries",
      "Technical Writing",
    ],
    contextWindow: 200_000,
    maxOutputTokens: 128_000,
    allowChat: true,
    price: {
      // Pricing: https://cloud.google.com/vertex-ai/generative-ai/pricing#claude-models
      inputTokens: 3,
      outputTokens: 15,
      unit: "perMillion",
    },
    api: LITE_LLM_API,
  },

  // Google
  "gemini-1.5-pro": {
    name: "Gemini 1.5 Pro",
    infoUrl: "https://deepmind.google/technologies/gemini/pro/",
    hostingLocation: "EU",
    provider: "Google",
    quality: 5,
    speed: 4,
    capabilities: ["Long inputs", "Documents", "Complex Queries"],
    contextWindow: 2_000_000,
    // todo: validate
    maxOutputTokens: 16384,
    allowChat: true,
    price: {
      // Pricing: https://cloud.google.com/skus?hl=en&filter=vertex%20Gemini%201.5%20Pro%20Text&currency=EUR
      // Attention:
      // - The price is given per 1000 characters, so we convert to tokens by multiplying by 4
      // - Prices differ depending on context window size, so we simply use the average token price
      inputTokens: 1.68,
      outputTokens: 6.73,
      unit: "perMillion",
    },
    api: LITE_LLM_API,
  },
  "gemini-2.0-flash": {
    name: "Gemini 2.0 Flash",
    infoUrl: "https://deepmind.google/technologies/gemini/flash/",
    hostingLocation: "EU",
    provider: "Google",
    quality: 4,
    speed: 5,
    capabilities: [
      "Long inputs",
      "Documents",
      "Complex Queries",
      "Programming",
    ],
    contextWindow: 1_000_000,
    maxOutputTokens: 8192,
    allowChat: true,
    price: {
      // Pricing input: https://cloud.google.com/skus?hl=en&filter=vertex%20Gemini%202.0%20Flash%20Text%20Input&currency=EUR
      // Pricing output: https://cloud.google.com/skus?hl=en&filter=vertex%20Gemini%202.0%20Flash%20Text%20Output&currency=EUR
      // Attention:
      // - The price is given per 1000 characters, so we convert to tokens by multiplying by 4
      // - Prices differ depending on context window size, so we simply use the average token price
      inputTokens: ((0.1430475 + 0.1430475) / 2) * 4, // SKUs: 2AF0-41D8-C5F1, 1127-99B9-1860
      outputTokens: ((0.57219 + 0.57219) / 2) * 4, // SKUs: AFFC-D3FD-B2FC, DFB0-8442-43A8
      unit: "perMillion",
    },
    api: LITE_LLM_API,
  },

  // Nebius models
  "llama-3.3-fast": {
    name: "Llama 3.3",
    infoUrl:
      "https://www.llama.com/docs/model-cards-and-prompt-formats/llama3_3",
    hostingLocation: "EU",
    provider: "Nebius",
    quality: 4,
    speed: 5,
    capabilities: [],
    contextWindow: 128_000,
    maxOutputTokens: 4096,
    allowChat: true,
    price: {
      // See https://studio.nebius.ai/
      inputTokens: 0.25,
      outputTokens: 0.75,
      unit: "perMillion",
    },
    api: LITE_LLM_API,
  },
  "deepseek-v3": {
    name: "DeepSeek-V3",
    infoUrl: "https://huggingface.co/deepseek-ai/DeepSeek-V3",
    hostingLocation: "EU",
    provider: "Nebius",
    quality: 4,
    speed: 3,
    capabilities: [],
    contextWindow: 128_000,
    maxOutputTokens: 4096,
    allowChat: true,
    price: {
      // See https://studio.nebius.ai/
      inputTokens: 0.5,
      outputTokens: 1.5,
      unit: "perMillion",
    },
    api: LITE_LLM_API,
  },
  "deepseek-r1": {
    name: "DeepSeek-R1",
    infoUrl: "https://huggingface.co/deepseek-ai/DeepSeek-R1",
    hostingLocation: "EU",
    provider: "Nebius",
    quality: 4,
    speed: 3,
    capabilities: [],
    contextWindow: 128_000,
    maxOutputTokens: 4096,
    allowChat: true,
    price: {
      // See https://studio.nebius.ai/
      inputTokens: 0.8,
      outputTokens: 2.4,
      unit: "perMillion",
    },
    api: LITE_LLM_API,
    includeInHealthCheck: false,
  },
} as const satisfies Record<string, LlmMetaData>;

/**
 * Zod type for parsing LLM model keys. Will fall back to gpt-4o-mini if the model is not invalid
 */
export const LlmName = z
  .string()
  .refine((x) => x in _LLM_META)
  .catch("gpt-4o-mini" as const satisfies LlmName)
  .transform((x) => x as LlmName);

/**
 * Union type of all available LLM model keys
 */
export type LlmName = keyof typeof _LLM_META;

/**
 * String array of all available LLM model keys
 */
export const LlmNames = Object.keys(_LLM_META) as LlmName[];

/**
 * Record of all LLM models and their metadata
 */
export const LLM_META: Record<LlmName, LlmMetaData> = _LLM_META;
