import type { IUserRepository } from "@/application/repositories/user.repository.interface.js";
import { deleteUserSchema, parseWithZod } from "@/validation/user.validation.js";

/** DeleteUser Use Case 입력 */
export interface DeleteUserInput {
  // User ID
  id: string;
}

/**
 * User 삭제 Use Case
 * ID로 User를 삭제
 */
export class DeleteUserUseCase {
  constructor(private readonly repo: IUserRepository) {}

  /**
   * Use Case 실행
   * @param input - User ID
   */
  async execute(input: DeleteUserInput): Promise<void> {
    // Zod 스키마로 검증
    const validated = parseWithZod(deleteUserSchema, input);
    await this.repo.delete(validated.id);
  }
}
