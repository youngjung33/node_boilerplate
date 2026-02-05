import type { User } from "@/domain/entities/user.entity.js";
import type { IUserRepository } from "@/application/repositories/user.repository.interface.js";
import { validateUserId } from "@/validation/user.validation.js";

/** GetUser Use Case 입력 */
export interface GetUserInput {
  // User ID
  id: string;
}

/** GetUser Use Case 결과 */
export interface GetUserResult {
  // User 또는 null (없을 경우)
  user: User | null;
}

/**
 * User 조회 Use Case
 * ID로 User를 조회하여 반환
 */
export class GetUserUseCase {
  constructor(private readonly repo: IUserRepository) {}

  /**
   * Use Case 실행
   * @param input - User ID
   * @returns User 또는 null
   */
  async execute(input: GetUserInput): Promise<GetUserResult> {
    // ID 검증
    const id = validateUserId(input?.id);
    const user = await this.repo.findById(id);
    return { user };
  }
}
