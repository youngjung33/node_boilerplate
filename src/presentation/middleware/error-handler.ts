import type { Request, Response, NextFunction } from "express";
import { AppError } from "@/shared/errors/index.js";

/**
 * Express 전역 에러 핸들러 미들웨어
 * AppError는 statusCode와 code를 사용하여 응답
 * 그 외 에러는 500 Internal Server Error로 처리
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  // 예상치 못한 에러
  console.error("Unexpected error:", err);
  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    },
  });
}
