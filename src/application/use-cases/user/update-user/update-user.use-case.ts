import type { User } from "@/domain/entities/user.entity.js";
import type { IUserRepository } from "@/application/interfaces/repositories/user.repository.interface.js";
import { ValidationError } from "@/shared/errors/index.js";

/**
 * Use Case 입력: id, 수정할 필드 (선택)
 */
export interface UpdateUserInput {
  id: string;
  email?: string;
  name?: string;
}

/**
 * Use Case 결과: 수정된 유저 또는 null
 */
export interface UpdateUserResult {
  user: User | null;
}

const MAX_ID_LENGTH = 255;
const MAX_EMAIL_LENGTH = 255;
const MAX_NAME_LENGTH = 100;
const RESERVED_IDS = new Set(["null", "undefined"]);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateId(id: unknown): string {
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
  return trimmed;
}

/**
 * Use Case: 유저 수정
 */
export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: UpdateUserInput): Promise<UpdateUserResult> {
    const raw = input ?? {};
    const id = validateId(raw.id);

    const email = raw.email;
    const name = raw.name;

    if (email !== undefined && email !== null) {
      if (typeof email !== "string") throw new ValidationError("email must be a string");
      const te = email.trim();
      if (te.length === 0) throw new ValidationError("email must not be empty");
      if (te.length > MAX_EMAIL_LENGTH) throw new ValidationError("email must not exceed 255 characters");
      if (!EMAIL_REGEX.test(te)) throw new ValidationError("email format is invalid");
      if ([...te].some((c) => c.charCodeAt(0) <= 0x1f)) {
        throw new ValidationError("email must not contain control characters");
      }
    }
    if (name !== undefined && name !== null) {
      if (typeof name !== "string") throw new ValidationError("name must be a string");
      const tn = name.trim();
      if (tn.length === 0) throw new ValidationError("name must not be empty");
      if (tn.length > MAX_NAME_LENGTH) throw new ValidationError("name must not exceed 100 characters");
      if ([...tn].some((c) => c.charCodeAt(0) <= 0x1f)) {
        throw new ValidationError("name must not contain control characters");
      }
    }

    const hasUpdate = (email !== undefined && email !== null) || (name !== undefined && name !== null);
    if (!hasUpdate) {
      throw new ValidationError("at least one of email or name must be provided");
    }

    const data: { email?: string; name?: string } = {};
    if (email !== undefined && email !== null) data.email = email.trim();
    if (name !== undefined && name !== null) data.name = name.trim();

    const user = await this.userRepository.update(id, data);
    return { user };
  }
}
