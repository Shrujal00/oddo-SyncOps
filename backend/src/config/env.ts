import "dotenv/config";

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.BACKEND_PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
  assistantEnabled: (process.env.ASSISTANT_ENABLED ?? "true").toLowerCase() === "true",
  ollamaApiKey: process.env.OLLAMA_API_KEY ?? "",
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "https://ollama.com",
  ollamaChatModel: process.env.OLLAMA_CHAT_MODEL ?? "gemma431b:cloud",
  ollamaEmbedModel: process.env.OLLAMA_EMBED_MODEL ?? "embeddinggemma",
} as const;
