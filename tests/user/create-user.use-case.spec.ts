import { describe, it, expect, vi } from "vitest";
import { CreateUserUseCase } from "@/application/use-cases/user/create-user.use-case.js";
import type { User } from "@/domain/entities/user.entity.js";
import { ValidationError } from "@/shared/errors/index.js";
import { createMockUserRepository } from "../helpers/mock-repository.js";

describe("CreateUserUseCase", () => {
  it("email 없으면 ValidationError", async () => {
    const repo = createMockUserRepository();
    const uc = new CreateUserUseCase(repo);
    await expect(uc.execute({ email: "", name: "A" })).rejects.toThrow(ValidationError);
    await expect(uc.execute({ name: "A" } as any)).rejects.toThrow(ValidationError);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("email 형식 잘못되면 ValidationError", async () => {
    const repo = createMockUserRepository();
    const uc = new CreateUserUseCase(repo);
    await expect(uc.execute({ email: "invalid", name: "A" })).rejects.toThrow(ValidationError);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("name 없으면 ValidationError", async () => {
    const repo = createMockUserRepository();
    const uc = new CreateUserUseCase(repo);
    await expect(uc.execute({ email: "a@b.com", name: "" })).rejects.toThrow(ValidationError);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("유효한 입력이면 create 호출 후 user 반환", async () => {
    const created: User = { id: "1", email: "a@b.com", name: "Alice", createdAt: new Date() };
    const repo = createMockUserRepository({ create: vi.fn().mockResolvedValue(created) });
    const uc = new CreateUserUseCase(repo);
    const result = await uc.execute({ email: "a@b.com", name: "Alice" });
    expect(result.user).toEqual(created);
    expect(repo.create).toHaveBeenCalledWith({ email: "a@b.com", name: "Alice" });
  });

  it("email/name 공백이면 trim 후 create 호출", async () => {
    const created: User = { id: "2", email: "x@y.com", name: "Bob", createdAt: new Date() };
    const repo = createMockUserRepository({ create: vi.fn().mockResolvedValue(created) });
    const uc = new CreateUserUseCase(repo);
    await uc.execute({ email: "  x@y.com  ", name: "  Bob  " });
    expect(repo.create).toHaveBeenCalledWith({ email: "x@y.com", name: "Bob" });
  });
});
