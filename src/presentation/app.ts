import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import passport from "passport";
import { createUserRouter, type UserUseCases } from "./routes/user.routes.js";
import { createAuthRouter } from "./routes/auth.routes.js";
import { errorHandler } from "./middleware/error-handler.js";
import { createRateLimiter } from "./middleware/rate-limit.middleware.js";
import { configurePassport } from "@/infrastructure/auth/passport.config.js";

/**
 * Express 앱 생성 및 설정
 * @param useCases - User Use Case 인스턴스들
 * @returns 설정된 Express 앱
 */
export function createApp(useCases: UserUseCases): Express {
  const app = express();

  // Helmet - 보안 헤더 설정
  app.use(helmet());

  // CORS - 전체 허용
  app.use(cors());

  // Rate Limiting - API 남용 방지
  app.use(createRateLimiter());

  // JSON body 파싱 미들웨어
  app.use(express.json());

  // Passport 초기화 (OAuth)
  configurePassport();
  app.use(passport.initialize());

  // Health check 엔드포인트 (보안 최소, 민감 정보 없음)
  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Auth 라우트 마운트 (OAuth)
  app.use("/auth", createAuthRouter());

  // User 라우트 마운트
  app.use("/users", createUserRouter(useCases));

  // 전역 에러 핸들러 (마지막에 등록)
  app.use(errorHandler);

  return app;
}
