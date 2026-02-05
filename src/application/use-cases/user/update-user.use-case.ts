import type { User } from "@/domain/entities/user.entity.js";
import type { IUserRepository } from "@/application/repositories/user.repository.interface.js";
import { ValidationError } from "@/shared/errors/index.js";
import { validateUserId, validateEmail, validateName } from "@/validation/user.validation.js";

/** UpdateUser Use Case 입력 */
export interface UpdateUserInput {
  // User ID
  id: string;
  // 수정할 이메일 (선택)
  email?: string;
  // 수정할 이름 (선택)
  name?: string;
}

/** UpdateUser Use Case 결과 */
export interface UpdateUserResult {
  // 수정된 User 또는 null (없을 경우)
  user: User | null;
}

/**
 * User 수정 Use Case
 * ID로 User를 찾아 email, name 중 하나 이상을 수정
 */
export class UpdateUserUseCase {
  constructor(private readonly repo: IUserRepository) {}

  /**
   * Use Case 실행
   * @param input - id, email, name (email, name 중 하나 이상 필수)
   * @returns 수정된 User 또는 null
   */
  async execute(input: UpdateUserInput): Promise<UpdateUserResult> {
    const raw = input ?? {};
    // id 검증
    const id = validateUserId(raw.id);
    // email, name 검증 (선택)
    const email = validateEmail(raw.email, false);
    const name = validateName(raw.name, false);
    // 둘 다 없으면 에러
    if (email === undefined && name === undefined) {
      throw new ValidationError("at least one of email or name must be provided");
    }
    // 수정할 데이터 구성
    const data: { email?: string; name?: string } = {};
    if (email !== undefined) data.email = email;
    if (name !== undefined) data.name = name;
    const user = await this.repo.update(id, data);
    return { user };
  }
}
