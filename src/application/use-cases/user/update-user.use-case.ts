import type { User } from "@/domain/entities/user.entity.js";
import type { IUserRepository } from "@/application/repositories/user.repository.interface.js";
import { ValidationError } from "@/shared/errors/index.js";
import { validateUserId, validateEmail, validateName } from "@/validation/user.validation.js";

export interface UpdateUserInput {
  id: string;
  email?: string;
  name?: string;
}

export interface UpdateUserResult {
  user: User | null;
}

export class UpdateUserUseCase {
  constructor(private readonly repo: IUserRepository) {}

  async execute(input: UpdateUserInput): Promise<UpdateUserResult> {
    const raw = input ?? {};
    const id = validateUserId(raw.id);
    const email = validateEmail(raw.email, false);
    const name = validateName(raw.name, false);
    if (email === undefined && name === undefined) {
      throw new ValidationError("at least one of email or name must be provided");
    }
    const data: { email?: string; name?: string } = {};
    if (email !== undefined) data.email = email;
    if (name !== undefined) data.name = name;
    const user = await this.repo.update(id, data);
    return { user };
  }
}
