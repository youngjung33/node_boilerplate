import { z } from "zod";

/**
 * 환경 변수 스키마 (Zod)
 */
const envSchema = z.object({
  // Node 실행 환경
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  // 서버 포트
  PORT: z.string().transform(Number).pipe(z.number().int().min(1).max(65535)).default("3000"),
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
