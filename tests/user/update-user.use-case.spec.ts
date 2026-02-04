import { describe, it, expect, vi } from "vitest";
import { UpdateUserUseCase } from "@/application/use-cases/user/update-user.use-case.js";
import type { User } from "@/domain/entities/user.entity.js";
import { ValidationError } from "@/shared/errors/index.js";
import { createMockUserRepository } from "../helpers/mock-repository.js";

describe("UpdateUserUseCase", () => {
  it("id 없으면 ValidationError", async () => {
    const repo = createMockUserRepository();
    const uc = new UpdateUserUseCase(repo);
    await expect(uc.execute({ id: "", name: "A" })).rejects.toThrow(ValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("email·name 둘 다 없으면 ValidationError", async () => {
    const repo = createMockUserRepository();
    const uc = new UpdateUserUseCase(repo);
    await expect(uc.execute({ id: "1" })).rejects.toThrow(ValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("name만 수정하면 update에 name만 전달", async () => {
    const updated: User = { id: "1", email: "a@b.com", name: "New", createdAt: new Date() };
    const repo = createMockUserRepository({ update: vi.fn().mockResolvedValue(updated) });
    const uc = new UpdateUserUseCase(repo);
    const result = await uc.execute({ id: "1", name: "New" });
    expect(result.user).toEqual(updated);
    expect(repo.update).toHaveBeenCalledWith("1", { name: "New" });
  });

  it("email·name 둘 다 수정하면 둘 다 전달", async () => {
    const updated: User = { id: "1", email: "n@b.com", name: "New", createdAt: new Date() };
    const repo = createMockUserRepository({ update: vi.fn().mockResolvedValue(updated) });
    const uc = new UpdateUserUseCase(repo);
    await uc.execute({ id: "1", email: "n@b.com", name: "New" });
    expect(repo.update).toHaveBeenCalledWith("1", { email: "n@b.com", name: "New" });
  });

  it("유저 없으면 result.user는 null", async () => {
    const repo = createMockUserRepository({ update: vi.fn().mockResolvedValue(null) });
    const uc = new UpdateUserUseCase(repo);
    const result = await uc.execute({ id: "none", name: "A" });
    expect(result.user).toBeNull();
  });
});
