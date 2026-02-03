import type { User } from "@/domain/entities/user.entity.js";

/**
 * Application layer: Repository 인터페이스
 * Infrastructure에서 구현. Use Case는 이 인터페이스에만 의존.
 */
export interface IUserRepository {
  // id로 유저 조회. 없으면 null
  findById(id: string): Promise<User | null>;
  // 유저 생성. 중복 이메일 시 에러 throw
  create(data: { email: string; name: string }): Promise<User>;
  // 유저 수정. 없으면 null
  update(id: string, data: { email?: string; name?: string }): Promise<User | null>;
  // 유저 삭제
  delete(id: string): Promise<void>;
  // 목록 조회 (페이지네이션)
  list(params: { offset: number; limit: number }): Promise<{ users: User[]; total: number }>;
}
