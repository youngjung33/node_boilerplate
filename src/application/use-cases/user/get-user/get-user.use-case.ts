import type { User } from "@/domain/entities/user.entity.js";
import type { IUserRepository } from "@/application/interfaces/repositories/user.repository.interface.js";
import { ValidationError } from "@/shared/errors/index.js";

/**
 * Use Case 입력: 유저 id
 */
export interface GetUserInput {
  // 유저 id
  id: string;
}

/**
 * Use Case 결과: 유저 또는 null
 */
export interface GetUserResult {
  // 유저 또는 null (없을 때)
  user: User | null;
}

// OWASP/스펙: id 최대 길이 (문자열 길이 제한)
const MAX_ID_LENGTH = 255;

// 예약 문자열 (API에서 id로 허용하지 않음)
const RESERVED_IDS = new Set(["null", "undefined"]);

/**
 * Use Case: ID로 유저 조회
 * Repository 인터페이스에만 의존. TDD로 테스트 시 Mock Repository 주입.
 */
export class GetUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * id로 유저 조회 실행
   */
  async execute(input: GetUserInput): Promise<GetUserResult> {
    const id = input?.id;
    if (id === undefined || id === null || typeof id !== "string") {
      throw new ValidationError("id is required");
    }
    const trimmed = id.trim();
    if (trimmed.length === 0) {
      throw new ValidationError("id must not be empty");
    }
    if (trimmed.length > MAX_ID_LENGTH) {
      throw new ValidationError("id must not exceed 255 characters");
    }
    if (RESERVED_IDS.has(trimmed)) {
      throw new ValidationError("id is reserved");
    }
    // null byte·제어문자(\u0000-\u001F) 허용하지 않음 (OWASP)
    if ([...trimmed].some((c) => c.charCodeAt(0) <= 0x1f)) {
      throw new ValidationError("id must not contain control characters");
    }
    const user = await this.userRepository.findById(trimmed);
    return { user };
  }
}
