import type { User } from "@/domain/entities/user.entity.js";
import type { IUserRepository } from "@/application/interfaces/repositories/user.repository.interface.js";
import { ValidationError } from "@/shared/errors/index.js";

/**
 * Use Case 입력: 페이지네이션
 */
export interface ListUsersInput {
  page: number;
  size: number;
}

/**
 * Use Case 결과: 목록 + 메타
 */
export interface ListUsersResult {
  users: User[];
  total: number;
  page: number;
  size: number;
}

const MIN_PAGE = 1;
const MAX_SIZE = 100;
const DEFAULT_SIZE = 20;

/**
 * Use Case: 유저 목록 조회 (페이지네이션)
 */
export class ListUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: ListUsersInput): Promise<ListUsersResult> {
    const raw = input ?? {};
    const page = raw.page;
    const size = raw.size;

    if (page === undefined || page === null) {
      throw new ValidationError("page is required");
    }
    if (typeof page !== "number" || Number.isNaN(page)) {
      throw new ValidationError("page must be a number");
    }
    if (page < MIN_PAGE || !Number.isInteger(page)) {
      throw new ValidationError("page must be an integer >= 1");
    }

    if (size === undefined || size === null) {
      throw new ValidationError("size is required");
    }
    if (typeof size !== "number" || Number.isNaN(size)) {
      throw new ValidationError("size must be a number");
    }
    if (size < 1 || !Number.isInteger(size)) {
      throw new ValidationError("size must be an integer >= 1");
    }
    if (size > MAX_SIZE) {
      throw new ValidationError("size must not exceed 100");
    }

    const offset = (page - 1) * size;
    const { users, total } = await this.userRepository.list({ offset, limit: size });
    return { users, total, page, size };
  }
}
