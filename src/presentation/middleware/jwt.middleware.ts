import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "@/shared/auth/jwt.js";
import { AppError } from "@/shared/errors/index.js";

/**
 * JWT 페이로드를 담기 위한 사용자 정의 타입
 */
export interface AuthenticatedUser {
  userId: string;
  email: string;
}

/**
 * Request에 user 정보 추가
 * Passport의 User 타입을 덮어쓰기
 */
declare global {
  namespace Express {
    // Passport의 User 타입을 AuthenticatedUser로 덮어쓰기
    interface User extends AuthenticatedUser {}
  }
}

/**
 * JWT 인증 미들웨어
 * Authorization: Bearer <token> 헤더에서 토큰 추출 및 검증
 */
export function jwtAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "No token provided",
      },
    });
    return;
  }

  const token = authHeader.substring(7); // "Bearer " 제거
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid or expired token",
      },
    });
    return;
  }

  // Request에 user 정보 추가
  req.user = payload;
  next();
}

/**
 * 선택적 JWT 인증 미들웨어
 * 토큰이 있으면 검증하고, 없어도 통과
 */
export function optionalJwtAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }

  next();
}
