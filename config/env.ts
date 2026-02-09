/**
 * 환경 변수 관리
 * env 스키마·기본값 (placeholder)
 * 향후 Zod 등으로 검증 추가 예정
 */
export const env = {
  // Node 실행 환경 (development | production | test)
  NODE_ENV: process.env.NODE_ENV ?? "development",
} as const;
