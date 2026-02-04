import type { User } from "@/domain/entities/user.entity.js";
import type { IUserRepository } from "@/application/repositories/user.repository.interface.js";
import { validateEmail, validateName } from "@/validation/user.validation.js";

export interface CreateUserInput {
  email: string;
  name: string;
}

export interface CreateUserResult {
  user: User;
}

export class CreateUserUseCase {
  constructor(private readonly repo: IUserRepository) {}

  async execute(input: CreateUserInput): Promise<CreateUserResult> {
    const raw = input ?? {};
    const email = validateEmail(raw.email, true);
    const name = validateName(raw.name, true);
    const user = await this.repo.create({ email, name });
    return { user };
  }
}
