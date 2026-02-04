import type { User } from "@/domain/entities/user.entity.js";
import type { IUserRepository } from "@/application/repositories/user.repository.interface.js";
import { validateUserId } from "@/validation/user.validation.js";

export interface GetUserInput {
  id: string;
}

export interface GetUserResult {
  user: User | null;
}

export class GetUserUseCase {
  constructor(private readonly repo: IUserRepository) {}

  async execute(input: GetUserInput): Promise<GetUserResult> {
    const id = validateUserId(input?.id);
    const user = await this.repo.findById(id);
    return { user };
  }
}
