import type { User } from "@/domain/entities/user.entity.js";

/**
 * Application layer: Repository 인터페이스
 * Infrastructure에서 구현. Use Case는 이 인터페이스에만 의존.
 */
export interface IUserRepository {
  // id로 유저 조회. 없으면 null
  findById(id: string): Promise<User | null>;
}
