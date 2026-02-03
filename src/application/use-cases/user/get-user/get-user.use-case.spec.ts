import { describe, it, expect, vi } from "vitest";
import { GetUserUseCase } from "./get-user.use-case.js";
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
 * TDD: 시나리오 전부 먼저
 * 모든 실패 케이스를 테스트로 먼저 다 적어 둔 뒤, 그 다음에 Use Case 구현.
 */
describe("GetUserUseCase (실패 케이스)", () => {
  it("id가 빈 문자열이면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new GetUserUseCase(mockRepo);
    await expect(useCase.execute({ id: "" })).rejects.toThrow(ValidationError);
    expect(mockRepo.findById).not.toHaveBeenCalled();
  });

  it("id가 공백만 있으면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new GetUserUseCase(mockRepo);
    await expect(useCase.execute({ id: "   " })).rejects.toThrow(ValidationError);
    expect(mockRepo.findById).not.toHaveBeenCalled();
  });

  it("id가 undefined이면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new GetUserUseCase(mockRepo);
    const input = { id: undefined } as unknown as { id: string };
    await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
    expect(mockRepo.findById).not.toHaveBeenCalled();
  });

  it("input 자체가 null이면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new GetUserUseCase(mockRepo);
    await expect(useCase.execute(null as unknown as { id: string })).rejects.toThrow(ValidationError);
    expect(mockRepo.findById).not.toHaveBeenCalled();
  });

  it("input 자체가 undefined이면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new GetUserUseCase(mockRepo);
    await expect(useCase.execute(undefined as unknown as { id: string })).rejects.toThrow(ValidationError);
    expect(mockRepo.findById).not.toHaveBeenCalled();
  });

  it("id가 number 타입이면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new GetUserUseCase(mockRepo);
    await expect(useCase.execute({ id: 123 } as unknown as { id: string })).rejects.toThrow(ValidationError);
    expect(mockRepo.findById).not.toHaveBeenCalled();
  });

  it("id가 null이면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new GetUserUseCase(mockRepo);
    await expect(useCase.execute({ id: null } as unknown as { id: string })).rejects.toThrow(ValidationError);
    expect(mockRepo.findById).not.toHaveBeenCalled();
  });

  it("id가 boolean이면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new GetUserUseCase(mockRepo);
    await expect(useCase.execute({ id: true } as unknown as { id: string })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ id: false } as unknown as { id: string })).rejects.toThrow(ValidationError);
    expect(mockRepo.findById).not.toHaveBeenCalled();
  });

  it("id가 object이면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new GetUserUseCase(mockRepo);
    await expect(useCase.execute({ id: {} } as unknown as { id: string })).rejects.toThrow(ValidationError);
    expect(mockRepo.findById).not.toHaveBeenCalled();
  });

  it("id가 array이면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new GetUserUseCase(mockRepo);
    await expect(useCase.execute({ id: [] } as unknown as { id: string })).rejects.toThrow(ValidationError);
    expect(mockRepo.findById).not.toHaveBeenCalled();
  });

  it("id가 탭·개행만 있으면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new GetUserUseCase(mockRepo);
    await expect(useCase.execute({ id: "\t\n\r" })).rejects.toThrow(ValidationError);
    expect(mockRepo.findById).not.toHaveBeenCalled();
  });

  it("id가 BigInt·Symbol·function이면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new GetUserUseCase(mockRepo);
    await expect(useCase.execute({ id: 1n } as unknown as { id: string })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ id: Symbol("x") } as unknown as { id: string })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ id: () => {} } as unknown as { id: string })).rejects.toThrow(ValidationError);
    expect(mockRepo.findById).not.toHaveBeenCalled();
  });

  it("repository.findById가 에러를 던지면 그 에러가 전파된다", async () => {
    const mockRepo = mockUserRepo({ findById: vi.fn().mockRejectedValue(new Error("DB failed")) });
    const useCase = new GetUserUseCase(mockRepo);
    await expect(useCase.execute({ id: "1" })).rejects.toThrow("DB failed");
    expect(mockRepo.findById).toHaveBeenCalledWith("1");
  });

  it("findById가 동기적으로 throw하면 그 에러가 전파된다", async () => {
    const mockRepo = mockUserRepo({ findById: vi.fn().mockImplementation(() => { throw new Error("sync"); }) });
    const useCase = new GetUserUseCase(mockRepo);
    await expect(useCase.execute({ id: "1" })).rejects.toThrow("sync");
    expect(mockRepo.findById).toHaveBeenCalledWith("1");
  });

  it("userRepository가 null이면 findById 호출 시 에러가 전파된다", async () => {
    const useCase = new GetUserUseCase(null as unknown as IUserRepository);
    await expect(useCase.execute({ id: "1" })).rejects.toThrow();
  });

  it("userRepository가 undefined이면 findById 호출 시 에러가 전파된다", async () => {
    const useCase = new GetUserUseCase(undefined as unknown as IUserRepository);
    await expect(useCase.execute({ id: "1" })).rejects.toThrow();
  });

  it("input이 빈 객체 {} 이면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new GetUserUseCase(mockRepo);
    await expect(useCase.execute({} as unknown as { id: string })).rejects.toThrow(ValidationError);
    expect(mockRepo.findById).not.toHaveBeenCalled();
  });

  it("id가 NaN·Infinity이면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new GetUserUseCase(mockRepo);
    await expect(useCase.execute({ id: NaN } as unknown as { id: string })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ id: Infinity } as unknown as { id: string })).rejects.toThrow(ValidationError);
    expect(mockRepo.findById).not.toHaveBeenCalled();
  });

  it("id에 null byte·제어문자가 포함되면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new GetUserUseCase(mockRepo);
    await expect(useCase.execute({ id: "a\u0000b" })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ id: "a\u0001b" })).rejects.toThrow(ValidationError);
    expect(mockRepo.findById).not.toHaveBeenCalled();
  });

  it("id가 최대 길이(255)를 초과하면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new GetUserUseCase(mockRepo);
    await expect(useCase.execute({ id: "a".repeat(256) })).rejects.toThrow(ValidationError);
    expect(mockRepo.findById).not.toHaveBeenCalled();
  });

  it("id가 예약 문자열 'null'·'undefined'이면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new GetUserUseCase(mockRepo);
    await expect(useCase.execute({ id: "null" })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ id: "undefined" })).rejects.toThrow(ValidationError);
    expect(mockRepo.findById).not.toHaveBeenCalled();
  });

  it("id가 RegExp·Date이면 ValidationError를 던진다", async () => {
    const mockRepo = mockUserRepo();
    const useCase = new GetUserUseCase(mockRepo);
    await expect(useCase.execute({ id: /a/ } as unknown as { id: string })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ id: new Date() } as unknown as { id: string })).rejects.toThrow(ValidationError);
    expect(mockRepo.findById).not.toHaveBeenCalled();
  });
});

describe("GetUserUseCase (성공 케이스)", () => {
  it("id로 유저가 있으면 user를 반환한다", async () => {
    const user: User = { id: "1", email: "a@b.com", name: "Alice", createdAt: new Date("2025-01-01") };
    const mockRepo = mockUserRepo({ findById: vi.fn().mockResolvedValue(user) });
    const useCase = new GetUserUseCase(mockRepo);
    const result = await useCase.execute({ id: "1" });
    expect(result.user).toEqual(user);
    expect(mockRepo.findById).toHaveBeenCalledWith("1");
  });

  it("id로 유저가 없으면 user는 null이다", async () => {
    const mockRepo = mockUserRepo({ findById: vi.fn().mockResolvedValue(null) });
    const useCase = new GetUserUseCase(mockRepo);
    const result = await useCase.execute({ id: "none" });
    expect(result.user).toBeNull();
    expect(mockRepo.findById).toHaveBeenCalledWith("none");
  });

  it("id 앞뒤 공백이 있으면 trim 후 findById를 호출하고 결과를 반환한다", async () => {
    const user: User = { id: "tid", email: "x@y.com", name: "Bob", createdAt: new Date("2025-02-01") };
    const mockRepo = mockUserRepo({ findById: vi.fn().mockResolvedValue(user) });
    const useCase = new GetUserUseCase(mockRepo);
    const result = await useCase.execute({ id: "  tid  " });
    expect(result.user).toEqual(user);
    expect(mockRepo.findById).toHaveBeenCalledWith("tid");
  });
});
