import { ErrorCode, type ErrorCodeType } from "./error-codes.js";

/**
 * 애플리케이션 기본 에러 클래스
 * 모든 커스텀 에러의 부모 클래스
 */
export class AppError extends Error {
  constructor(
    message: string,
    // 에러 코드 (API 응답용)
    public readonly code: ErrorCodeType = ErrorCode.INTERNAL_SERVER_ERROR,
    // HTTP 상태 코드
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * 입력 검증 실패 에러
 * HTTP 400 Bad Request
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, ErrorCode.VALIDATION_ERROR, 400);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * 리소스를 찾을 수 없음 에러
 * HTTP 404 Not Found
 */
export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, ErrorCode.NOT_FOUND, 404);
    this.name = "NotFoundError";
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * 충돌 에러 (중복 등)
 * HTTP 409 Conflict
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, ErrorCode.CONFLICT, 409);
    this.name = "ConflictError";
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
