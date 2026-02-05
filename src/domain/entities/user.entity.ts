/**
 * User 엔티티
 * DB/프레임워크 무관한 도메인 모델
 */
export interface User {
  // User 고유 식별자
  id: string;
  // 이메일 주소 (로그인·연락용)
  email: string;
  // 표시 이름
  name: string;
  // 생성 시각 (UTC)
  createdAt: Date;
}
