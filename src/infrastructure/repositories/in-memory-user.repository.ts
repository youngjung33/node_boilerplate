import type { User } from "@/domain/entities/user.entity.js";
import type { IUserRepository } from "@/application/repositories/user.repository.interface.js";
import { ConflictError } from "@/shared/errors/index.js";

/**
 * 인메모리 User Repository 구현체
 * 테스트·개발용으로 Map을 사용하여 메모리에 데이터 저장
 */
export class InMemoryUserRepository implements IUserRepository {
  // User 데이터를 저장하는 Map (id → User)
  private readonly store = new Map<string, User>();
  // User ID 생성용 시퀀스
  private idSeq = 1;

  /**
   * ID로 User 조회
   * @param id - User ID
   * @returns User 또는 null (없을 경우)
   */
  async findById(id: string): Promise<User | null> {
    return this.store.get(id) ?? null;
  }

  /**
   * 새 User 생성
   * @param data - email, name
   * @returns 생성된 User
   * @throws ConflictError - 이메일 중복 시
   */
  async create(data: { email: string; name: string }): Promise<User> {
    // 이메일 중복 체크
    for (const u of this.store.values()) {
      if (u.email === data.email) throw new ConflictError("email already exists");
    }
    // 새 ID 생성
    const id = String(this.idSeq++);
    const user: User = { id, ...data, createdAt: new Date() };
    this.store.set(id, user);
    return user;
  }

  /**
   * User 정보 수정
   * @param id - User ID
   * @param data - 수정할 email, name (선택)
   * @returns 수정된 User 또는 null (없을 경우)
   * @throws ConflictError - 이메일 중복 시
   */
  async update(id: string, data: { email?: string; name?: string }): Promise<User | null> {
    const u = this.store.get(id);
    if (!u) return null;
    if (data.email !== undefined) {
      // 이메일 중복 체크 (자기 자신 제외)
      for (const o of this.store.values()) {
        if (o.id !== id && o.email === data.email) throw new ConflictError("email already exists");
      }
      u.email = data.email;
    }
    if (data.name !== undefined) u.name = data.name;
    this.store.set(id, u);
    return u;
  }

  /**
   * User 삭제
   * @param id - User ID
   */
  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  /**
   * User 목록 조회 (페이지네이션)
   * @param params - offset, limit
   * @returns User 목록과 전체 개수
   */
  async list(params: { offset: number; limit: number }): Promise<{ users: User[]; total: number }> {
    const all = [...this.store.values()];
    return {
      users: all.slice(params.offset, params.offset + params.limit),
      total: all.length,
    };
  }
}
