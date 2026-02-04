import { vi } from "vitest";
import type { IUserRepository } from "@/application/repositories/user.repository.interface.js";

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
