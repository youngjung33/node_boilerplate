/**
 * shared/errors barrel
 * ErrorCode + 모든 커스텀 에러 클래스 export.
 */
export { ErrorCode, type ErrorCodeType } from "./error-codes.js";
export {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
  ConflictError,
  UnprocessableEntityError,
  TooManyRequestsError,
  InternalServerError,
  ServiceUnavailableError,
} from "./app-error.js";
