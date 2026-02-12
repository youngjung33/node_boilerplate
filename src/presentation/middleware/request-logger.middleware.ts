import type { Request, Response, NextFunction } from "express";
import Logger from "@/shared/logger/logger.js";

/**
 * HTTP 요청 로깅 미들웨어
 * 모든 API 요청을 로그로 기록
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  // 응답 완료 시 로그 출력
  res.on("finish", () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.path} ${res.statusCode} - ${duration}ms`;

    if (res.statusCode >= 500) {
      Logger.error(message);
    } else if (res.statusCode >= 400) {
      Logger.warn(message);
    } else {
      Logger.http(message);
    }
  });

  next();
}
