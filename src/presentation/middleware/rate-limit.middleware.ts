import rateLimit from "express-rate-limit";
import { env } from "../../../config/env.js";

/**
 * Rate Limiting 미들웨어 생성
 * API 남용 방지를 위한 요청 횟수 제한
 */
export function createRateLimiter() {
  // Rate limiting이 비활성화되어 있으면 통과 미들웨어 반환
  if (env.RATE_LIMIT_DISABLED) {
    return (req: any, res: any, next: any) => next();
  }

  return rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS, // 시간 윈도우
    max: env.RATE_LIMIT_MAX, // 윈도우당 최대 요청 수
    message: {
      error: {
        code: "TOO_MANY_REQUESTS",
        message: "Too many requests, please try again later",
      },
    },
    standardHeaders: true, // `RateLimit-*` 헤더 추가
    legacyHeaders: false, // `X-RateLimit-*` 헤더 비활성화
  });
}
