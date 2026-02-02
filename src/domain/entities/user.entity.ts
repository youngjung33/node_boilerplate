/**
 * Domain entity: User
 * DB/프레임워크 무관한 비즈니스 규칙만 둠.
 */
export interface User {
  // 유저 고유 식별자
  id: string;
  // 이메일 (로그인·연락용)
  email: string;
  // 표시 이름
  name: string;
  // 생성 시각 (UTC)
  createdAt: Date;
}
