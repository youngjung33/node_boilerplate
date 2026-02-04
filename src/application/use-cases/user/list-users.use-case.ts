import type { User } from "@/domain/entities/user.entity.js";
import type { IUserRepository } from "@/application/repositories/user.repository.interface.js";
import { validatePageSize } from "@/validation/user.validation.js";

export interface ListUsersInput {
  page: number;
  size: number;
}

export interface ListUsersResult {
  users: User[];
  total: number;
  page: number;
  size: number;
}

export class ListUsersUseCase {
  constructor(private readonly repo: IUserRepository) {}

  async execute(input: ListUsersInput): Promise<ListUsersResult> {
    const raw = input ?? {};
    const { page, size } = validatePageSize(raw.page, raw.size);
    const offset = (page - 1) * size;
    const { users, total } = await this.repo.list({ offset, limit: size });
    return { users, total, page, size };
  }
}
