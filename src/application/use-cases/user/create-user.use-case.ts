import type { User } from "@/domain/entities/user.entity.js";
import type { IUserRepository } from "@/application/repositories/user.repository.interface.js";
import { validateEmail, validateName } from "@/validation/user.validation.js";

/** CreateUser Use Case 입력 */
export interface CreateUserInput {
  // 이메일
  email: string;
  // 이름
  name: string;
}

/** CreateUser Use Case 결과 */
export interface CreateUserResult {
  // 생성된 User
  user: User;
}

/**
 * User 생성 Use Case
 * 이메일과 이름을 받아 새 User를 생성
 */
export class CreateUserUseCase {
  constructor(private readonly repo: IUserRepository) {}

  /**
   * Use Case 실행
   * @param input - email, name
   * @returns 생성된 User
   */
  async execute(input: CreateUserInput): Promise<CreateUserResult> {
    const raw = input ?? {};
    // email, name 검증
    const email = validateEmail(raw.email, true);
    const name = validateName(raw.name, true);
    const user = await this.repo.create({ email, name });
    return { user };
  }
}
