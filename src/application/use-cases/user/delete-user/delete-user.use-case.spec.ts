import { describe, it, expect, vi } from "vitest";
import { DeleteUserUseCase } from "./delete-user.use-case.js";
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
 * DeleteUserUseCase 실패 케이스만 (TDD: 시나리오 전부 먼저)
 */
describe("DeleteUserUseCase (실패 케이스)", () => {
  it("input이 null·undefined이면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new DeleteUserUseCase(mockRepo);
    await expect(useCase.execute(null as unknown as { id: string })).rejects.toThrow(ValidationError);
    await expect(useCase.execute(undefined as unknown as { id: string })).rejects.toThrow(ValidationError);
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });

  it("id가 빈 문자열·공백만·undefined·null이면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new DeleteUserUseCase(mockRepo);
    await expect(useCase.execute({ id: "" })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ id: "   " })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ id: undefined } as unknown as { id: string })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ id: null } as unknown as { id: string })).rejects.toThrow(ValidationError);
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });

  it("id가 문자열이 아니면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new DeleteUserUseCase(mockRepo);
    await expect(useCase.execute({ id: 123 } as unknown as { id: string })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ id: true } as unknown as { id: string })).rejects.toThrow(ValidationError);
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });

  it("id가 예약 문자열 'null'·'undefined'이면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new DeleteUserUseCase(mockRepo);
    await expect(useCase.execute({ id: "null" })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ id: "undefined" })).rejects.toThrow(ValidationError);
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });

  it("id가 최대 길이(255)를 초과하면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new DeleteUserUseCase(mockRepo);
    await expect(useCase.execute({ id: "a".repeat(256) })).rejects.toThrow(ValidationError);
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });

  it("repository.delete가 에러를 던지면 그 에러가 전파된다", async () => {
    const mockRepo = mockUserRepo({ delete: vi.fn().mockRejectedValue(new Error("DB error")) });
    const useCase = new DeleteUserUseCase(mockRepo);
    await expect(useCase.execute({ id: "1" })).rejects.toThrow("DB error");
    expect(mockRepo.delete).toHaveBeenCalledWith("1");
  });
});

describe("DeleteUserUseCase (성공 케이스)", () => {
  it("유효한 id로 execute하면 repository.delete가 해당 id로 호출된다", async () => {
    const mockRepo = mockUserRepo({ delete: vi.fn().mockResolvedValue(undefined) });
    const useCase = new DeleteUserUseCase(mockRepo);
    await useCase.execute({ id: "user-1" });
    expect(mockRepo.delete).toHaveBeenCalledWith("user-1");
  });

  it("id 앞뒤 공백이 있으면 trim 후 delete를 호출한다", async () => {
    const mockRepo = mockUserRepo({ delete: vi.fn().mockResolvedValue(undefined) });
    const useCase = new DeleteUserUseCase(mockRepo);
    await useCase.execute({ id: "  uid  " });
    expect(mockRepo.delete).toHaveBeenCalledWith("uid");
  });
});
