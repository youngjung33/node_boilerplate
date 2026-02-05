import type { User } from "@/domain/entities/user.entity.js";

/**
 * User Repository 인터페이스
 * Infrastructure에서 구현, Use Case는 이 인터페이스에만 의존
 */
export interface IUserRepository {
  /** ID로 User 조회 */
  findById(id: string): Promise<User | null>;
  /** 새 User 생성 */
  create(data: { email: string; name: string }): Promise<User>;
  /** User 정보 수정 */
  update(id: string, data: { email?: string; name?: string }): Promise<User | null>;
  /** User 삭제 */
  delete(id: string): Promise<void>;
  /** User 목록 조회 (페이지네이션) */
  list(params: { offset: number; limit: number }): Promise<{ users: User[]; total: number }>;
}
