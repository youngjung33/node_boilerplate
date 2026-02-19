import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import passport from "passport";
import { createUserRouter, type UserUseCases } from "./routes/user.routes.js";
import { createAuthRouter } from "./routes/auth.routes.js";
import { createPaymentRouter, type PaymentUseCases } from "./routes/payment.routes.js";
import { createFileRouter, type FileUseCases } from "./routes/file.routes.js";
import { errorHandler } from "./middleware/error-handler.js";
import { createRateLimiter } from "./middleware/rate-limit.middleware.js";
import { requestLogger } from "./middleware/request-logger.middleware.js";
import { configurePassport } from "@/infrastructure/auth/passport.config.js";
import { stripeClient } from "@/infrastructure/payment/stripe.client.js";
import { googlePlayClient } from "@/infrastructure/payment/google-play.client.js";
import { appleIAPClient } from "@/infrastructure/payment/apple-iap.client.js";
import { s3Client } from "@/infrastructure/storage/s3.client.js";
import { env } from "../../config/env.js";
import Logger from "@/shared/logger/logger.js";

/**
 * 모든 Use Cases 타입
 */
export interface AllUseCases extends UserUseCases, PaymentUseCases, FileUseCases {}

/**
 * Express 앱 생성 및 설정
 * @param useCases - 모든 Use Case 인스턴스들
 * @returns 설정된 Express 앱
 */
export function createApp(useCases: AllUseCases): Express {
  const app = express();

  // Helmet - 보안 헤더 설정
  app.use(helmet());

  // CORS - 전체 허용
  app.use(cors());

  // Rate Limiting - API 남용 방지
  app.use(createRateLimiter());

  // Stripe 웹훅을 위한 raw body 처리
  // Stripe 서명 검증을 위해 raw body가 필요하므로 /webhooks/stripe 경로만 특별 처리
  app.use(
    "/v1/payment/webhooks/stripe",
    express.raw({ type: "application/json" })
  );

  // JSON body 파싱 미들웨어 (다른 모든 경로)
  app.use(express.json());

  // HTTP 요청 로깅
  app.use(requestLogger);

  // Passport 초기화 (OAuth)
  configurePassport();
  app.use(passport.initialize());

  // Payment 클라이언트 초기화 (ENABLE_PAYMENT=true일 때만)
  if (env.ENABLE_PAYMENT) {
    stripeClient.initialize();
    googlePlayClient.initialize().catch((err) => {
      Logger.error("Google Play client initialization failed", err);
    });
    appleIAPClient.initialize();
    Logger.info("✅ Payment clients initialized");
  }

  // S3 클라이언트 초기화 (ENABLE_FILE_UPLOAD=true일 때만)
  if (env.ENABLE_FILE_UPLOAD) {
    s3Client.initialize();
    Logger.info("✅ S3 File Upload client initialized");
  }

  // Health check 엔드포인트 (보안 최소, 민감 정보 없음)
  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API v1 라우트
  const v1Router = express.Router();
  
  // Auth 라우트 마운트 (OAuth)
  v1Router.use("/auth", createAuthRouter());

  // User 라우트 마운트
  v1Router.use("/users", createUserRouter(useCases));

  // Payment 라우트 마운트 (ENABLE_PAYMENT=true일 때만)
  if (env.ENABLE_PAYMENT) {
    v1Router.use("/payment", createPaymentRouter(useCases));
    Logger.info("✅ Payment routes registered");
  }

  // File 라우트 마운트 (ENABLE_FILE_UPLOAD=true일 때만)
  if (env.ENABLE_FILE_UPLOAD) {
    v1Router.use("/files", createFileRouter(useCases));
    Logger.info("✅ File routes registered");
  }

  // v1 라우터를 앱에 마운트
  app.use("/v1", v1Router);

  Logger.info("✅ API v1 routes registered");

  // 전역 에러 핸들러 (마지막에 등록)
  app.use(errorHandler);

  return app;
}
