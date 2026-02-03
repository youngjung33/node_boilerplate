import type { IUserRepository } from "@/application/interfaces/repositories/user.repository.interface.js";
import { ValidationError } from "@/shared/errors/index.js";

/**
 * Use Case 입력: 유저 id
 */
export interface DeleteUserInput {
  id: string;
}

const MAX_ID_LENGTH = 255;
const RESERVED_IDS = new Set(["null", "undefined"]);

/**
 * Use Case: 유저 삭제
 */
export class DeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: DeleteUserInput): Promise<void> {
    const id = input?.id;
    if (id === undefined || id === null || typeof id !== "string") {
      throw new ValidationError("id is required");
    }
    const trimmed = id.trim();
    if (trimmed.length === 0) throw new ValidationError("id must not be empty");
    if (trimmed.length > MAX_ID_LENGTH) throw new ValidationError("id must not exceed 255 characters");
    if (RESERVED_IDS.has(trimmed)) throw new ValidationError("id is reserved");
    if ([...trimmed].some((c) => c.charCodeAt(0) <= 0x1f)) {
      throw new ValidationError("id must not contain control characters");
    }
    await this.userRepository.delete(trimmed);
  }
}
