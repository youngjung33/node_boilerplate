import express, { type Express } from "express";
import { createUserRouter, type UserUseCases } from "./routes/user.routes.js";
import { errorHandler } from "./middleware/error-handler.js";

/**
 * Express 앱 생성 및 설정
 * @param useCases - User Use Case 인스턴스들
 * @returns 설정된 Express 앱
 */
export function createApp(useCases: UserUseCases): Express {
  const app = express();

  // JSON body 파싱 미들웨어
  app.use(express.json());

  // User 라우트 마운트
  app.use("/users", createUserRouter(useCases));

  // Health check 엔드포인트
  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // 전역 에러 핸들러 (마지막에 등록)
  app.use(errorHandler);

  return app;
}
