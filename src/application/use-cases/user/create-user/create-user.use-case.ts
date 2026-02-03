import type { User } from "@/domain/entities/user.entity.js";
import type { IUserRepository } from "@/application/interfaces/repositories/user.repository.interface.js";
import { ValidationError } from "@/shared/errors/index.js";

/**
 * Use Case 입력: 이메일, 이름
 */
export interface CreateUserInput {
  // 이메일
  email: string;
  // 표시 이름
  name: string;
}

/**
 * Use Case 결과: 생성된 유저
 */
export interface CreateUserResult {
  user: User;
}

const MAX_EMAIL_LENGTH = 255;
const MAX_NAME_LENGTH = 100;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Use Case: 유저 생성
 */
export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: CreateUserInput): Promise<CreateUserResult> {
    const raw = input ?? {};
    const email = raw.email;
    const name = raw.name;

    if (email === undefined || email === null || typeof email !== "string") {
      throw new ValidationError("email is required");
    }
    const trimmedEmail = email.trim();
    if (trimmedEmail.length === 0) {
      throw new ValidationError("email must not be empty");
    }
    if (trimmedEmail.length > MAX_EMAIL_LENGTH) {
      throw new ValidationError("email must not exceed 255 characters");
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      throw new ValidationError("email format is invalid");
    }
    if ([...trimmedEmail].some((c) => c.charCodeAt(0) <= 0x1f)) {
      throw new ValidationError("email must not contain control characters");
    }

    if (name === undefined || name === null || typeof name !== "string") {
      throw new ValidationError("name is required");
    }
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      throw new ValidationError("name must not be empty");
    }
    if (trimmedName.length > MAX_NAME_LENGTH) {
      throw new ValidationError("name must not exceed 100 characters");
    }
    if ([...trimmedName].some((c) => c.charCodeAt(0) <= 0x1f)) {
      throw new ValidationError("name must not contain control characters");
    }

    const user = await this.userRepository.create({ email: trimmedEmail, name: trimmedName });
    return { user };
  }
}
