import type { OAuthCredentials, OAuthLoginCallbacks } from "@earendil-works/pi-ai";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const PROVIDER_ID = "glm-coding-plan";
const PROVIDER_NAME = "GLM Coding Plan";
const DEFAULT_BASE_URL = "https://open.bigmodel.cn/api/coding/paas/v4";
const MODELS_DEV_URL = "https://models.dev/api.json";
const MODELS_DEV_PROVIDER_KEY = "zhipuai-coding-plan";
const NAME_SUFFIX = " (Plan)";
const FETCH_TIMEOUT_MS = 4000;

type ProviderModel = {
  id: string;
  name: string;
  reasoning: boolean;
  input: Array<"text" | "image">;
  cost: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
  };
  contextWindow: number;
  maxTokens: number;
};

const DEFAULT_MODELS: ProviderModel[] = [
  {
    id: "glm-4.5",
    name: "GLM-4.5 (Plan)",
    reasoning: true,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 131072,
    maxTokens: 98304,
  },
  {
    id: "glm-4.5-air",
    name: "GLM-4.5-Air (Plan)",
    reasoning: true,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 131072,
    maxTokens: 98304,
  },
  {
    id: "glm-4.5-flash",
    name: "GLM-4.5-Flash (Plan)",
    reasoning: true,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 131072,
    maxTokens: 98304,
  },
  {
    id: "glm-4.5v",
    name: "GLM-4.5V (Plan)",
    reasoning: true,
    input: ["text", "image"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 64000,
    maxTokens: 16384,
  },
  {
    id: "glm-4.6",
    name: "GLM-4.6 (Plan)",
    reasoning: true,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 204800,
    maxTokens: 131072,
  },
  {
    id: "glm-4.6v",
    name: "GLM-4.6V (Plan)",
    reasoning: true,
    input: ["text", "image"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 128000,
    maxTokens: 32768,
  },
  {
    id: "glm-4.6v-flash",
    name: "GLM-4.6V-Flash (Plan)",
    reasoning: true,
    input: ["text", "image"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 128000,
    maxTokens: 32768,
  },
  {
    id: "glm-4.7",
    name: "GLM-4.7 (Plan)",
    reasoning: true,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 204800,
    maxTokens: 131072,
  },
  {
    id: "glm-4.7-flash",
    name: "GLM-4.7-Flash (Plan)",
    reasoning: true,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 200000,
    maxTokens: 131072,
  },
  {
    id: "glm-4.7-flashx",
    name: "GLM-4.7-FlashX (Plan)",
    reasoning: true,
    input: ["text"],
    cost: { input: 0.07, output: 0.4, cacheRead: 0.01, cacheWrite: 0 },
    contextWindow: 200000,
    maxTokens: 131072,
  },
  {
    id: "glm-5",
    name: "GLM-5 (Plan)",
    reasoning: true,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 204800,
    maxTokens: 131072,
  },
  {
    id: "glm-5-turbo",
    name: "GLM-5-Turbo (Plan)",
    reasoning: true,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 200000,
    maxTokens: 131072,
  },
  {
    id: "glm-5.1",
    name: "GLM-5.1 (Plan)",
    reasoning: true,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 200000,
    maxTokens: 131072,
  },
  {
    id: "glm-5v-turbo",
    name: "GLM-5V-Turbo (Plan)",
    reasoning: true,
    input: ["text", "image"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 200000,
    maxTokens: 131072,
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toFiniteNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeInput(value: unknown): Array<"text" | "image"> {
  if (!isRecord(value) || !Array.isArray(value.input)) return ["text"];
  const inputs = value.input.filter((item): item is string => typeof item === "string");
  return inputs.includes("image") || inputs.includes("video") || inputs.includes("pdf")
    ? ["text", "image"]
    : ["text"];
}

function normalizeProviderModel(id: string, value: unknown): ProviderModel | undefined {
  if (!isRecord(value)) return undefined;

  const cost = isRecord(value.cost) ? value.cost : {};
  const limit = isRecord(value.limit) ? value.limit : {};
  const rawName = typeof value.name === "string" && value.name.trim() ? value.name.trim() : id;

  return {
    id,
    name: rawName + NAME_SUFFIX,
    reasoning: value.reasoning === true,
    input: normalizeInput(value.modalities),
    cost: {
      input: toFiniteNumber(cost.input ?? cost.input_price),
      output: toFiniteNumber(cost.output ?? cost.output_price),
      cacheRead: toFiniteNumber(cost.cacheRead ?? cost.cache_read),
      cacheWrite: toFiniteNumber(cost.cacheWrite ?? cost.cache_write),
    },
    contextWindow: Math.max(1, Math.floor(toFiniteNumber(limit.context ?? limit.contextWindow, 200000))),
    maxTokens: Math.max(1, Math.floor(toFiniteNumber(limit.output ?? limit.maxTokens, 131072))),
  };
}

async function fetchModelsFromModelsDev(): Promise<ProviderModel[] | undefined> {
  try {
    const res = await fetch(MODELS_DEV_URL);
    if (!res.ok) return undefined;
    const data = (await res.json()) as Record<string, unknown>;
    const provider = data[MODELS_DEV_PROVIDER_KEY];
    if (!isRecord(provider) || !isRecord(provider.models)) return undefined;

    const models = Object.entries(provider.models as Record<string, unknown>)
      .map(([id, val]) => normalizeProviderModel(id, val))
      .filter((model): model is ProviderModel => Boolean(model))
      .sort((a, b) => a.id.localeCompare(b.id));

    return models.length > 0 ? models : undefined;
  } catch {
    return undefined;
  }
}

async function loginWithApiKey(callbacks: OAuthLoginCallbacks): Promise<OAuthCredentials> {
  const key = (await callbacks.onPrompt({ message: `Paste ${PROVIDER_NAME} API key:` })).trim();

  if (!key) throw new Error("No API key provided.");

  return {
    access: key,
    refresh: key,
    expires: Date.now() + 3650 * 24 * 60 * 60 * 1000,
  };
}

async function refreshApiKey(credentials: OAuthCredentials): Promise<OAuthCredentials> {
  return credentials;
}

export default async function glmCodingPlanExtension(pi: ExtensionAPI) {
  const baseUrl = process.env.GLM_CODING_PLAN_BASE_URL || DEFAULT_BASE_URL;

  const providerConfig = (models: ProviderModel[]) => ({
    baseUrl,
    apiKey: "$GLM_CODING_PLAN_API_KEY",
    api: "openai-completions" as const,
    models,
    oauth: {
      name: PROVIDER_NAME,
      login: loginWithApiKey,
      refreshToken: refreshApiKey,
      getApiKey: (credentials: OAuthCredentials) => credentials.access,
    },
  });

  const fetchedModels = await Promise.race([
    fetchModelsFromModelsDev(),
    new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), FETCH_TIMEOUT_MS)),
  ]);

  pi.registerProvider(PROVIDER_ID, providerConfig(fetchedModels ?? DEFAULT_MODELS));
}
