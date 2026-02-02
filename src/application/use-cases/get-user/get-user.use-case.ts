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
    const user = await this.userRepository.findById(trimmed);
    return { user };
  }
}
