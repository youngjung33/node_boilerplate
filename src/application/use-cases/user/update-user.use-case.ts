import type { User } from "@/domain/entities/user.entity.js";
import type { IUserRepository } from "@/application/repositories/user.repository.interface.js";
import { updateUserSchema, parseWithZod } from "@/validation/user.validation.js";

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
    // Zod 스키마로 검증
    const validated = parseWithZod(updateUserSchema, input);
    
    // 수정할 데이터 구성
    const data: { email?: string; name?: string } = {};
    if (validated.email !== undefined) data.email = validated.email;
    if (validated.name !== undefined) data.name = validated.name;
    
    const user = await this.repo.update(validated.id, data);
    return { user };
  }
}
