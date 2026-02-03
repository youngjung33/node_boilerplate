import { describe, it, expect, vi } from "vitest";
import { CreateUserUseCase } from "./create-user.use-case.js";
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
 * CreateUserUseCase 실패 케이스만 (TDD: 시나리오 전부 먼저)
 */
describe("CreateUserUseCase (실패 케이스)", () => {
  it("input이 null·undefined이면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new CreateUserUseCase(mockRepo);
    await expect(useCase.execute(null as unknown as { email: string; name: string })).rejects.toThrow(ValidationError);
    await expect(useCase.execute(undefined as unknown as { email: string; name: string })).rejects.toThrow(ValidationError);
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it("email이 없거나 빈 문자열이면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new CreateUserUseCase(mockRepo);
    await expect(useCase.execute({ email: "", name: "A" })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ email: "   ", name: "A" })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ name: "A" } as unknown as { email: string; name: string })).rejects.toThrow(ValidationError);
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it("email이 문자열이 아니면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new CreateUserUseCase(mockRepo);
    await expect(useCase.execute({ email: 123, name: "A" } as unknown as { email: string; name: string })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ email: null, name: "A" } as unknown as { email: string; name: string })).rejects.toThrow(ValidationError);
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it("email 형식이 잘못되면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new CreateUserUseCase(mockRepo);
    await expect(useCase.execute({ email: "invalid", name: "A" })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ email: "a@", name: "A" })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ email: "@b.com", name: "A" })).rejects.toThrow(ValidationError);
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it("email이 최대 길이(255)를 초과하면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new CreateUserUseCase(mockRepo);
    const long = "a".repeat(250) + "@b.com";
    await expect(useCase.execute({ email: long, name: "A" })).rejects.toThrow(ValidationError);
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it("name이 없거나 빈 문자열이면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new CreateUserUseCase(mockRepo);
    await expect(useCase.execute({ email: "a@b.com", name: "" })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ email: "a@b.com", name: "   " })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ email: "a@b.com" } as unknown as { email: string; name: string })).rejects.toThrow(ValidationError);
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it("name이 문자열이 아니면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new CreateUserUseCase(mockRepo);
    await expect(useCase.execute({ email: "a@b.com", name: 123 } as unknown as { email: string; name: string })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ email: "a@b.com", name: null } as unknown as { email: string; name: string })).rejects.toThrow(ValidationError);
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it("name이 최대 길이(100)를 초과하면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new CreateUserUseCase(mockRepo);
    await expect(useCase.execute({ email: "a@b.com", name: "a".repeat(101) })).rejects.toThrow(ValidationError);
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it("repository.create가 에러를 던지면 그 에러가 전파된다", async () => {
    const mockRepo = mockUserRepo({ create: vi.fn().mockRejectedValue(new Error("Duplicate email")) });
    const useCase = new CreateUserUseCase(mockRepo);
    await expect(useCase.execute({ email: "a@b.com", name: "A" })).rejects.toThrow("Duplicate email");
    expect(mockRepo.create).toHaveBeenCalledWith({ email: "a@b.com", name: "A" });
  });
});

describe("CreateUserUseCase (성공 케이스)", () => {
  it("유효한 email·name으로 execute하면 repository.create가 호출되고 생성된 user를 반환한다", async () => {
    const created: User = { id: "u1", email: "a@b.com", name: "Alice", createdAt: new Date("2025-01-01") };
    const mockRepo = mockUserRepo({ create: vi.fn().mockResolvedValue(created) });
    const useCase = new CreateUserUseCase(mockRepo);
    const result = await useCase.execute({ email: "a@b.com", name: "Alice" });
    expect(result.user).toEqual(created);
    expect(mockRepo.create).toHaveBeenCalledWith({ email: "a@b.com", name: "Alice" });
  });

  it("email·name 앞뒤 공백이 있으면 trim 후 create에 넘기고 결과를 반환한다", async () => {
    const created: User = { id: "u2", email: "x@y.com", name: "Bob", createdAt: new Date("2025-02-01") };
    const mockRepo = mockUserRepo({ create: vi.fn().mockResolvedValue(created) });
    const useCase = new CreateUserUseCase(mockRepo);
    const result = await useCase.execute({ email: "  x@y.com  ", name: "  Bob  " });
    expect(result.user).toEqual(created);
    expect(mockRepo.create).toHaveBeenCalledWith({ email: "x@y.com", name: "Bob" });
  });
});
