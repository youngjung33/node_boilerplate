import { vi } from "vitest";
import type { IUserRepository } from "@/application/repositories/user.repository.interface.js";

/**
 * Mock User Repository 생성 헬퍼
 * Use Case 테스트에서 Repository 의존성을 간편하게 mock 처리
 * @param overrides - 특정 메서드만 override하고 싶을 때 사용
 * @returns Mock User Repository
 */
export function createMockUserRepository(overrides: Partial<IUserRepository> = {}): IUserRepository {
  return {
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
    ...overrides,
  };
}
