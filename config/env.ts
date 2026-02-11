import { z } from "zod";

/**
 * 환경 변수 스키마 (Zod)
 */
const envSchema = z.object({
  // Node 실행 환경
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  // 서버 포트
  PORT: z.string().default("3000").transform(Number).pipe(z.number().int().min(1).max(65535)),
  
  // JWT 설정
  JWT_SECRET: z.string().min(1).default("your-secret-key-change-in-production"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  
  // OAuth 기능 스위치
  ENABLE_OAUTH: z.string().default("false").transform((v) => v === "true"),
  
  // OAuth Google 설정
  OAUTH_GOOGLE_CLIENT_ID: z.string().optional(),
  OAUTH_GOOGLE_CLIENT_SECRET: z.string().optional(),
  OAUTH_GOOGLE_CALLBACK_URL: z.string().optional(),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default("900000").transform(Number).pipe(z.number().int().min(0)), // 15분
  RATE_LIMIT_MAX: z.string().default("100").transform(Number).pipe(z.number().int().min(1)),
  RATE_LIMIT_DISABLED: z.string().default("false").transform((v) => v === "true"),
});

/**
 * 환경 변수 파싱 및 검증
 */
function parseEnv() {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    console.error(result.error.format());
    throw new Error("Environment validation failed");
  }
  
  return result.data;
}

/**
 * 검증된 환경 변수
 */
export const env = parseEnv();
