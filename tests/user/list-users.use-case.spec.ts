import { describe, it, expect, vi } from "vitest";
import { ListUsersUseCase } from "@/application/use-cases/user/list-users.use-case.js";
import { ValidationError } from "@/shared/errors/index.js";
import { createMockUserRepository } from "../helpers/mock-repository.js";

describe("ListUsersUseCase", () => {
  it("page 없으면 ValidationError", async () => {
    const repo = createMockUserRepository();
    const uc = new ListUsersUseCase(repo);
    await expect(uc.execute({ size: 10 } as any)).rejects.toThrow(ValidationError);
    expect(repo.list).not.toHaveBeenCalled();
  });

  it("size 100 초과면 ValidationError", async () => {
    const repo = createMockUserRepository();
    const uc = new ListUsersUseCase(repo);
    await expect(uc.execute({ page: 1, size: 101 })).rejects.toThrow(ValidationError);
    expect(repo.list).not.toHaveBeenCalled();
  });

  it("page 1, size 10이면 offset 0, limit 10으로 list 호출", async () => {
    const users = [{ id: "1", email: "a@b.com", name: "A", createdAt: new Date() }];
    const repo = createMockUserRepository({ list: vi.fn().mockResolvedValue({ users, total: 1 }) });
    const uc = new ListUsersUseCase(repo);
    const result = await uc.execute({ page: 1, size: 10 });
    expect(result.users).toEqual(users);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.size).toBe(10);
    expect(repo.list).toHaveBeenCalledWith({ offset: 0, limit: 10 });
  });

  it("page 2, size 20이면 offset 20, limit 20", async () => {
    const repo = createMockUserRepository({ list: vi.fn().mockResolvedValue({ users: [], total: 0 }) });
    const uc = new ListUsersUseCase(repo);
    await uc.execute({ page: 2, size: 20 });
    expect(repo.list).toHaveBeenCalledWith({ offset: 20, limit: 20 });
  });
});
