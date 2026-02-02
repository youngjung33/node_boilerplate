import { ErrorCode, type ErrorCodeType } from "./error-codes.js";

/**
 * 공통 에러 클래스 (통합 에러 처리용)
 * 구현 단계에서 HTTP 상태 코드 매핑 등 확장.
 */
export class AppError extends Error {
  constructor(
    message: string,
    // 에러 코드 (클라이언트 식별용). ErrorCode 상수 사용.
    public readonly code: ErrorCodeType = ErrorCode.INTERNAL_SERVER_ERROR,
    // HTTP 상태 코드 (기본 500)
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = "AppError";
    // prototype 체인 유지 (extends Error 시 권장)
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * 검증 실패 에러 (입력값 오류 등)
 * statusCode 400.
 */
export class ValidationError extends AppError {
  constructor(message: string, code: ErrorCodeType = ErrorCode.VALIDATION_ERROR) {
    super(message, code, 400);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * 리소스 없음 에러 (404)
 * statusCode 404.
 */
export class NotFoundError extends AppError {
  constructor(message: string, code: ErrorCodeType = ErrorCode.NOT_FOUND) {
    super(message, code, 404);
    this.name = "NotFoundError";
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * 인증 실패 에러 (401)
 * statusCode 401.
 */
export class UnauthorizedError extends AppError {
  constructor(message: string, code: ErrorCodeType = ErrorCode.UNAUTHORIZED) {
    super(message, code, 401);
    this.name = "UnauthorizedError";
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * 권한 없음 에러 (403)
 * statusCode 403.
 */
export class ForbiddenError extends AppError {
  constructor(message: string, code: ErrorCodeType = ErrorCode.FORBIDDEN) {
    super(message, code, 403);
    this.name = "ForbiddenError";
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * 요청 형식/내용 오류 (400, 검증 외)
 * statusCode 400.
 */
export class BadRequestError extends AppError {
  constructor(message: string, code: ErrorCodeType = ErrorCode.BAD_REQUEST) {
    super(message, code, 400);
    this.name = "BadRequestError";
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

/**
 * 충돌 에러 (중복·상태 불일치 등) (409)
 * statusCode 409.
 */
export class ConflictError extends AppError {
  constructor(message: string, code: ErrorCodeType = ErrorCode.CONFLICT) {
    super(message, code, 409);
    this.name = "ConflictError";
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * 처리 불가 에러 (422)
 * statusCode 422.
 */
export class UnprocessableEntityError extends AppError {
  constructor(
    message: string,
    code: ErrorCodeType = ErrorCode.UNPROCESSABLE_ENTITY
  ) {
    super(message, code, 422);
    this.name = "UnprocessableEntityError";
    Object.setPrototypeOf(this, UnprocessableEntityError.prototype);
  }
}

/**
 * Rate limit 초과 (429)
 * statusCode 429.
 */
export class TooManyRequestsError extends AppError {
  constructor(
    message: string,
    code: ErrorCodeType = ErrorCode.TOO_MANY_REQUESTS
  ) {
    super(message, code, 429);
    this.name = "TooManyRequestsError";
    Object.setPrototypeOf(this, TooManyRequestsError.prototype);
  }
}

/**
 * 내부 서버 에러 (500)
 * statusCode 500.
 */
export class InternalServerError extends AppError {
  constructor(
    message: string,
    code: ErrorCodeType = ErrorCode.INTERNAL_SERVER_ERROR
  ) {
    super(message, code, 500);
    this.name = "InternalServerError";
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

/**
 * 서비스 이용 불가 (503)
 * statusCode 503.
 */
export class ServiceUnavailableError extends AppError {
  constructor(
    message: string,
    code: ErrorCodeType = ErrorCode.SERVICE_UNAVAILABLE
  ) {
    super(message, code, 503);
    this.name = "ServiceUnavailableError";
    Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
  }
}
