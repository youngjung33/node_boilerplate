import type { User } from "@/domain/entities/user.entity.js";
import type { IUserRepository } from "@/application/repositories/user.repository.interface.js";
import { listUsersSchema, parseWithZod } from "@/validation/user.validation.js";

/** ListUsers Use Case 입력 */
export interface ListUsersInput {
  // 페이지 번호 (1부터 시작)
  page: number;
  // 페이지 크기 (1~100)
  size: number;
}

/** ListUsers Use Case 결과 */
export interface ListUsersResult {
  // User 목록
  users: User[];
  // 전체 User 개수
  total: number;
  // 페이지 번호
  page: number;
  // 페이지 크기
  size: number;
}

/**
 * User 목록 조회 Use Case
 * 페이지네이션으로 User 목록을 조회
 */
export class ListUsersUseCase {
  constructor(private readonly repo: IUserRepository) {}

  /**
   * Use Case 실행
   * @param input - page, size
   * @returns User 목록과 메타 정보
   */
  async execute(input: ListUsersInput): Promise<ListUsersResult> {
    // Zod 스키마로 검증
    const { page, size } = parseWithZod(listUsersSchema, input);
    // offset 계산 (0부터 시작)
    const offset = (page - 1) * size;
    const { users, total } = await this.repo.list({ offset, limit: size });
    return { users, total, page, size };
  }
}
