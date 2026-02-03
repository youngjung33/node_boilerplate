import { describe, it, expect, vi } from "vitest";
import { UpdateUserUseCase } from "./update-user.use-case.js";
import type { IUserRepository } from "@/application/interfaces/repositories/user.repository.interface.js";
import type { User } from "@/domain/entities/user.entity.js";
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
 * UpdateUserUseCase 실패 케이스만 (TDD: 시나리오 전부 먼저)
 */
describe("UpdateUserUseCase (실패 케이스)", () => {
  it("input이 null·undefined이면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new UpdateUserUseCase(mockRepo);
    await expect(useCase.execute(null as unknown as { id: string })).rejects.toThrow(ValidationError);
    await expect(useCase.execute(undefined as unknown as { id: string })).rejects.toThrow(ValidationError);
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it("id가 없거나 빈 문자열·공백만이면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new UpdateUserUseCase(mockRepo);
    await expect(useCase.execute({ id: "", name: "A" })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ id: "   ", email: "a@b.com" })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ id: undefined, name: "A" } as unknown as { id: string; name?: string })).rejects.toThrow(ValidationError);
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it("id가 문자열이 아니면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new UpdateUserUseCase(mockRepo);
    await expect(useCase.execute({ id: 123, name: "A" } as unknown as { id: string; name?: string })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ id: null, name: "A" } as unknown as { id: string; name?: string })).rejects.toThrow(ValidationError);
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it("email·name 둘 다 없으면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new UpdateUserUseCase(mockRepo);
    await expect(useCase.execute({ id: "1" })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ id: "1", email: undefined, name: undefined })).rejects.toThrow(ValidationError);
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it("email만 있고 형식이 잘못되면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new UpdateUserUseCase(mockRepo);
    await expect(useCase.execute({ id: "1", email: "invalid" })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ id: "1", email: "" })).rejects.toThrow(ValidationError);
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it("name만 있고 빈 문자열이면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new UpdateUserUseCase(mockRepo);
    await expect(useCase.execute({ id: "1", name: "" })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ id: "1", name: "   " })).rejects.toThrow(ValidationError);
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it("repository.update가 에러를 던지면 그 에러가 전파된다", async () => {
    const mockRepo = mockUserRepo({ update: vi.fn().mockRejectedValue(new Error("DB error")) });
    const useCase = new UpdateUserUseCase(mockRepo);
    await expect(useCase.execute({ id: "1", name: "A" })).rejects.toThrow("DB error");
    expect(mockRepo.update).toHaveBeenCalledWith("1", { name: "A" });
  });
});

describe("UpdateUserUseCase (성공 케이스)", () => {
  it("name만 수정하면 update에 name만 넘기고 수정된 user를 반환한다", async () => {
    const updated: User = { id: "1", email: "a@b.com", name: "Alice Updated", createdAt: new Date("2025-01-01") };
    const mockRepo = mockUserRepo({ update: vi.fn().mockResolvedValue(updated) });
    const useCase = new UpdateUserUseCase(mockRepo);
    const result = await useCase.execute({ id: "1", name: "Alice Updated" });
    expect(result.user).toEqual(updated);
    expect(mockRepo.update).toHaveBeenCalledWith("1", { name: "Alice Updated" });
  });

  it("email만 수정하면 update에 email만 넘기고 수정된 user를 반환한다", async () => {
    const updated: User = { id: "1", email: "new@b.com", name: "Alice", createdAt: new Date("2025-01-01") };
    const mockRepo = mockUserRepo({ update: vi.fn().mockResolvedValue(updated) });
    const useCase = new UpdateUserUseCase(mockRepo);
    const result = await useCase.execute({ id: "1", email: "new@b.com" });
    expect(result.user).toEqual(updated);
    expect(mockRepo.update).toHaveBeenCalledWith("1", { email: "new@b.com" });
  });

  it("email과 name 둘 다 수정하면 update에 둘 다 넘기고 수정된 user를 반환한다", async () => {
    const updated: User = { id: "u2", email: "x@y.com", name: "Bob", createdAt: new Date("2025-02-01") };
    const mockRepo = mockUserRepo({ update: vi.fn().mockResolvedValue(updated) });
    const useCase = new UpdateUserUseCase(mockRepo);
    const result = await useCase.execute({ id: "u2", email: "x@y.com", name: "Bob" });
    expect(result.user).toEqual(updated);
    expect(mockRepo.update).toHaveBeenCalledWith("u2", { email: "x@y.com", name: "Bob" });
  });

  it("유저가 없으면 repository.update가 null을 반환하고 result.user는 null이다", async () => {
    const mockRepo = mockUserRepo({ update: vi.fn().mockResolvedValue(null) });
    const useCase = new UpdateUserUseCase(mockRepo);
    const result = await useCase.execute({ id: "none", name: "A" });
    expect(result.user).toBeNull();
    expect(mockRepo.update).toHaveBeenCalledWith("none", { name: "A" });
  });
});
