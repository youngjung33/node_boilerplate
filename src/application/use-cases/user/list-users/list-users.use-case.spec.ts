import { describe, it, expect, vi } from "vitest";
import { ListUsersUseCase } from "./list-users.use-case.js";
import type { IUserRepository } from "@/application/interfaces/repositories/user.repository.interface.js";
import { ValidationError } from "@/shared/errors/index.js";

function mockUserRepo(overrides: Partial<IUserRepository> = {}): IUserRepository {
  return {
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
    ...overrides,
  };
}

/**
 * ListUsersUseCase 실패 케이스만 (TDD: 시나리오 전부 먼저)
 */
describe("ListUsersUseCase (실패 케이스)", () => {
  it("input이 null·undefined이면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new ListUsersUseCase(mockRepo);
    await expect(useCase.execute(null as unknown as { page: number; size: number })).rejects.toThrow(ValidationError);
    await expect(useCase.execute(undefined as unknown as { page: number; size: number })).rejects.toThrow(ValidationError);
    expect(mockRepo.list).not.toHaveBeenCalled();
  });

  it("page가 없거나 숫자가 아니면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new ListUsersUseCase(mockRepo);
    await expect(useCase.execute({ size: 10 } as unknown as { page: number; size: number })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ page: "1", size: 10 } as unknown as { page: number; size: number })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ page: NaN, size: 10 })).rejects.toThrow(ValidationError);
    expect(mockRepo.list).not.toHaveBeenCalled();
  });

  it("page가 1 미만이거나 정수가 아니면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new ListUsersUseCase(mockRepo);
    await expect(useCase.execute({ page: 0, size: 10 })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ page: -1, size: 10 })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ page: 1.5, size: 10 })).rejects.toThrow(ValidationError);
    expect(mockRepo.list).not.toHaveBeenCalled();
  });

  it("size가 없거나 숫자가 아니면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new ListUsersUseCase(mockRepo);
    await expect(useCase.execute({ page: 1 } as unknown as { page: number; size: number })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ page: 1, size: "10" } as unknown as { page: number; size: number })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ page: 1, size: NaN })).rejects.toThrow(ValidationError);
    expect(mockRepo.list).not.toHaveBeenCalled();
  });

  it("size가 1 미만이거나 정수가 아니면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new ListUsersUseCase(mockRepo);
    await expect(useCase.execute({ page: 1, size: 0 })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ page: 1, size: -1 })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ page: 1, size: 10.5 })).rejects.toThrow(ValidationError);
    expect(mockRepo.list).not.toHaveBeenCalled();
  });

  it("size가 100을 초과하면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new ListUsersUseCase(mockRepo);
    await expect(useCase.execute({ page: 1, size: 101 })).rejects.toThrow(ValidationError);
    expect(mockRepo.list).not.toHaveBeenCalled();
  });

  it("repository.list가 에러를 던지면 그 에러가 전파된다", async () => {
    const mockRepo = mockUserRepo({ list: vi.fn().mockRejectedValue(new Error("DB error")) });
    const useCase = new ListUsersUseCase(mockRepo);
    await expect(useCase.execute({ page: 1, size: 10 })).rejects.toThrow("DB error");
    expect(mockRepo.list).toHaveBeenCalledWith({ offset: 0, limit: 10 });
  });
});

describe("ListUsersUseCase (성공 케이스)", () => {
  it("page 1, size 10이면 offset 0, limit 10으로 list를 호출하고 결과를 그대로 반환한다", async () => {
    const users = [
      { id: "1", email: "a@b.com", name: "Alice", createdAt: new Date("2025-01-01") },
      { id: "2", email: "b@b.com", name: "Bob", createdAt: new Date("2025-01-02") },
    ];
    const mockRepo = mockUserRepo({ list: vi.fn().mockResolvedValue({ users, total: 2 }) });
    const useCase = new ListUsersUseCase(mockRepo);
    const result = await useCase.execute({ page: 1, size: 10 });
    expect(result.users).toEqual(users);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.size).toBe(10);
    expect(mockRepo.list).toHaveBeenCalledWith({ offset: 0, limit: 10 });
  });

  it("page 2, size 20이면 offset 20, limit 20으로 list를 호출한다", async () => {
    const users: { id: string; email: string; name: string; createdAt: Date }[] = [];
    const mockRepo = mockUserRepo({ list: vi.fn().mockResolvedValue({ users, total: 50 }) });
    const useCase = new ListUsersUseCase(mockRepo);
    await useCase.execute({ page: 2, size: 20 });
    expect(mockRepo.list).toHaveBeenCalledWith({ offset: 20, limit: 20 });
  });

  it("빈 목록이면 users는 빈 배열, total은 0으로 반환한다", async () => {
    const mockRepo = mockUserRepo({ list: vi.fn().mockResolvedValue({ users: [], total: 0 }) });
    const useCase = new ListUsersUseCase(mockRepo);
    const result = await useCase.execute({ page: 1, size: 10 });
    expect(result.users).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.page).toBe(1);
    expect(result.size).toBe(10);
  });
});
