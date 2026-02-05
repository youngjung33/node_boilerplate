/**
 * 애플리케이션 에러 코드 상수
 * API 응답에서 에러 종류를 구분하기 위해 사용
 */
export const ErrorCode = {
  // 입력 검증 실패
  VALIDATION_ERROR: "VALIDATION_ERROR",
  // 리소스를 찾을 수 없음
  NOT_FOUND: "NOT_FOUND",
  // 충돌 (중복 등)
  CONFLICT: "CONFLICT",
  // 내부 서버 오류
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

/** ErrorCode의 타입 */
export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];
