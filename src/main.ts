/**
 * 앱 조립·진입점 (placeholder)
 * Use Case 검증 완료 후 DB·OAuth·결제·FCM 바인딩 및 서버 기동 구현.
 */
export async function bootstrap(): Promise<void> {
  // TDD 완료 후 구현
  // - Repository 구현체 주입
  // - Express 서버·미들웨어·라우트 등록
  // - 기능 스위치(ENABLE_*)에 따른 OAuth·결제·FCM 등록/미기동
}

bootstrap().catch(console.error);
