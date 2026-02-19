import { z } from "zod";
import { config } from "dotenv";

// .env 파일 로드
config();

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
  
  // FCM 기능 스위치
  ENABLE_FCM: z.string().default("false").transform((v) => v === "true"),
  
  // FCM 설정
  FCM_SERVICE_ACCOUNT_PATH: z.string().optional(),
  FCM_BATCH_CRON: z.string().default("*/5 * * * *"), // 매 5분마다
  FCM_BATCH_SIZE: z.string().default("100").transform(Number).pipe(z.number().int().min(1).max(500)),
  
  // DB 타입 선택
  DB_TYPE: z.enum(["memory", "sqlite", "mariadb", "mongodb", "supabase"]).default("memory"),
  
  // SQLite 설정
  DB_SQLITE_PATH: z.string().default("./data/db.sqlite"),
  
  // Supabase 설정
  DB_SUPABASE_URL: z.string().optional(),
  DB_SUPABASE_KEY: z.string().optional(),
  
  // MariaDB 설정
  DB_MARIADB_HOST: z.string().default("localhost"),
  DB_MARIADB_PORT: z.string().default("3306").transform(Number).pipe(z.number().int().min(1).max(65535)),
  DB_MARIADB_USER: z.string().default("root"),
  DB_MARIADB_PASSWORD: z.string().default(""),
  DB_MARIADB_DATABASE: z.string().default("mydb"),
  
  // MongoDB 설정
  DB_MONGODB_URI: z.string().default("mongodb://localhost:27017/mydb"),
  
  // Payment 기능 스위치
  ENABLE_PAYMENT: z.string().default("false").transform((v) => v === "true"),
  
  // Stripe 설정 (일반 결제)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // Apple IAP 설정 (앱 결제)
  APPLE_IAP_SHARED_SECRET: z.string().optional(),
  
  // Google Play 설정 (앱 결제 - Pub/Sub)
  GOOGLE_PLAY_SERVICE_ACCOUNT_PATH: z.string().optional(),
  GOOGLE_PLAY_PUBSUB_SUBSCRIPTION: z.string().optional(),
  GOOGLE_PLAY_PACKAGE_NAME: z.string().optional(),
  
  // File Upload 기능 스위치
  ENABLE_FILE_UPLOAD: z.string().default("false").transform((v) => v === "true"),
  
  // AWS S3 설정 (파일 업로드)
  AWS_S3_BUCKET: z.string().optional(),
  AWS_REGION: z.string().default("us-east-1"),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  FILE_SIZE_LIMIT: z.string().default("10485760").transform(Number).pipe(z.number().int().min(0)), // 10MB
  FILE_COMPRESS_THRESHOLD: z.string().default("2097152").transform(Number).pipe(z.number().int().min(0)), // 2MB
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
