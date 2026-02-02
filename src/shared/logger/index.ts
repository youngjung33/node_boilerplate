/**
 * 통합 Logger (placeholder)
 * 구현 단계에서 실제 로거 인스턴스로 교체.
 */
export const logger = {
  // info 레벨 로그
  info: (msg: string, ...args: unknown[]) => console.log("[INFO]", msg, ...args),
  // warn 레벨 로그
  warn: (msg: string, ...args: unknown[]) => console.warn("[WARN]", msg, ...args),
  // error 레벨 로그
  error: (msg: string, ...args: unknown[]) => console.error("[ERROR]", msg, ...args),
};
