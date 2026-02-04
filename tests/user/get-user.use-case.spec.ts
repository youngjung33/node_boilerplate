import { describe, it, expect, vi } from "vitest";
import { GetUserUseCase } from "@/application/use-cases/user/get-user.use-case.js";
import type { User } from "@/domain/entities/user.entity.js";
import { ValidationError } from "@/shared/errors/index.js";
import { createMockUserRepository } from "../helpers/mock-repository.js";

describe("GetUserUseCase", () => {
  it("id가 빈 문자열이면 ValidationError", async () => {
    const repo = createMockUserRepository();
    const uc = new GetUserUseCase(repo);
    await expect(uc.execute({ id: "" })).rejects.toThrow(ValidationError);
    expect(repo.findById).not.toHaveBeenCalled();
  });

  it("id가 공백만 있으면 ValidationError", async () => {
    const repo = createMockUserRepository();
    const uc = new GetUserUseCase(repo);
    await expect(uc.execute({ id: "   " })).rejects.toThrow(ValidationError);
    expect(repo.findById).not.toHaveBeenCalled();
  });

  it("id가 undefined이면 ValidationError", async () => {
    const repo = createMockUserRepository();
    const uc = new GetUserUseCase(repo);
    await expect(uc.execute({ id: undefined } as any)).rejects.toThrow(ValidationError);
    expect(repo.findById).not.toHaveBeenCalled();
  });

  it("id가 255 초과면 ValidationError", async () => {
    const repo = createMockUserRepository();
    const uc = new GetUserUseCase(repo);
    await expect(uc.execute({ id: "a".repeat(256) })).rejects.toThrow(ValidationError);
    expect(repo.findById).not.toHaveBeenCalled();
  });

  it("id가 예약어면 ValidationError", async () => {
    const repo = createMockUserRepository();
    const uc = new GetUserUseCase(repo);
    await expect(uc.execute({ id: "null" })).rejects.toThrow(ValidationError);
    await expect(uc.execute({ id: "undefined" })).rejects.toThrow(ValidationError);
    expect(repo.findById).not.toHaveBeenCalled();
  });

  it("유효한 id면 findById 호출 후 user 반환", async () => {
    const user: User = { id: "1", email: "a@b.com", name: "A", createdAt: new Date() };
    const repo = createMockUserRepository({ findById: vi.fn().mockResolvedValue(user) });
    const uc = new GetUserUseCase(repo);
    const result = await uc.execute({ id: "1" });
    expect(result.user).toEqual(user);
    expect(repo.findById).toHaveBeenCalledWith("1");
  });

  it("유저 없으면 user는 null", async () => {
    const repo = createMockUserRepository({ findById: vi.fn().mockResolvedValue(null) });
    const uc = new GetUserUseCase(repo);
    const result = await uc.execute({ id: "none" });
    expect(result.user).toBeNull();
    expect(repo.findById).toHaveBeenCalledWith("none");
  });

  it("id 공백이면 trim 후 findById 호출", async () => {
    const user: User = { id: "x", email: "x@y.com", name: "X", createdAt: new Date() };
    const repo = createMockUserRepository({ findById: vi.fn().mockResolvedValue(user) });
    const uc = new GetUserUseCase(repo);
    await uc.execute({ id: "  x  " });
    expect(repo.findById).toHaveBeenCalledWith("x");
  });
});
