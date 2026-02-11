import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../../../config/env.js";

/**
 * JWT Payload 인터페이스
 */
export interface JwtPayload {
  userId: string;
  email: string;
}

/**
 * JWT 토큰 생성
 * @param payload - 토큰에 담을 데이터
 * @returns JWT 토큰 문자열
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  } as SignOptions);
}

/**
 * JWT 토큰 검증
 * @param token - 검증할 토큰
 * @returns 디코딩된 페이로드 또는 null
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
