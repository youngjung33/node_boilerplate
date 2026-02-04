import { describe, it, expect, vi } from "vitest";
import { DeleteUserUseCase } from "@/application/use-cases/user/delete-user.use-case.js";
import { ValidationError } from "@/shared/errors/index.js";
import { createMockUserRepository } from "../helpers/mock-repository.js";

describe("DeleteUserUseCase", () => {
  it("id 없으면 ValidationError", async () => {
    const repo = createMockUserRepository();
    const uc = new DeleteUserUseCase(repo);
    await expect(uc.execute({ id: "" })).rejects.toThrow(ValidationError);
    await expect(uc.execute({ id: undefined } as any)).rejects.toThrow(ValidationError);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it("id 예약어면 ValidationError", async () => {
    const repo = createMockUserRepository();
    const uc = new DeleteUserUseCase(repo);
    await expect(uc.execute({ id: "null" })).rejects.toThrow(ValidationError);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it("유효한 id면 delete 호출", async () => {
    const repo = createMockUserRepository({ delete: vi.fn().mockResolvedValue(undefined) });
    const uc = new DeleteUserUseCase(repo);
    await uc.execute({ id: "1" });
    expect(repo.delete).toHaveBeenCalledWith("1");
  });

  it("id 공백이면 trim 후 delete 호출", async () => {
    const repo = createMockUserRepository({ delete: vi.fn().mockResolvedValue(undefined) });
    const uc = new DeleteUserUseCase(repo);
    await uc.execute({ id: "  x  " });
    expect(repo.delete).toHaveBeenCalledWith("x");
  });
});
