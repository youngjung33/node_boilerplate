/**
 * env 스키마·기본값 (placeholder)
 * 구현 단계에서 Zod 등으로 검증 추가.
 */
export const env = {
  // development | production | test (환경 구분은 사용하지 않음)
  NODE_ENV: process.env.NODE_ENV ?? "development",
} as const;
