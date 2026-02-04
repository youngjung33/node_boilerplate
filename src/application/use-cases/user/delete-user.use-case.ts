import type { IUserRepository } from "@/application/repositories/user.repository.interface.js";
import { validateUserId } from "@/validation/user.validation.js";

export interface DeleteUserInput {
  id: string;
}

export class DeleteUserUseCase {
  constructor(private readonly repo: IUserRepository) {}

  async execute(input: DeleteUserInput): Promise<void> {
    const id = validateUserId(input?.id);
    await this.repo.delete(id);
  }
}
