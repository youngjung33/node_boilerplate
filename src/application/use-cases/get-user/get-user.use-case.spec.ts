import { describe, it, expect, vi } from "vitest";
import { GetUserUseCase } from "./get-user.use-case.js";
import type { IUserRepository } from "@/application/interfaces/repositories/user.repository.interface.js";
import { ValidationError } from "@/shared/errors/index.js";

/**
 * GetUserUseCase 실패 케이스만 검증 (TDD)
 * 성공 Use Case는 검증 완료 후 별도 추가.
 */
describe("GetUserUseCase (실패 케이스)", () => {
  it("id가 빈 문자열이면 ValidationError를 던진다", async () => {
    // given: Mock Repository
    const mockRepo: IUserRepository = {
      findById: vi.fn(),
    };
    const useCase = new GetUserUseCase(mockRepo);

    // when: execute({ id: "" })
    // then: ValidationError, findById 미호출
    await expect(useCase.execute({ id: "" })).rejects.toThrow(ValidationError);
    expect(mockRepo.findById).not.toHaveBeenCalled();
  });

  it("id가 공백만 있으면 ValidationError를 던진다", async () => {
    // given: Mock Repository
    const mockRepo: IUserRepository = {
      findById: vi.fn(),
    };
    const useCase = new GetUserUseCase(mockRepo);

    // when: execute({ id: "   " })
    await expect(useCase.execute({ id: "   " })).rejects.toThrow(ValidationError);
    expect(mockRepo.findById).not.toHaveBeenCalled();
  });

  it("id가 undefined이면 ValidationError를 던진다", async () => {
    // given: input.id 없음 (타입상 string이지만 런타임에 undefined 가능)
    const mockRepo: IUserRepository = {
      findById: vi.fn(),
    };
    const useCase = new GetUserUseCase(mockRepo);
    const input = { id: undefined } as unknown as { id: string };

    // when: execute(input)
    await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
    expect(mockRepo.findById).not.toHaveBeenCalled();
  });

  it("repository.findById가 에러를 던지면 그 에러가 전파된다", async () => {
    // given: findById가 에러 throw
    const repoError = new Error("DB connection failed");
    const mockRepo: IUserRepository = {
      findById: vi.fn().mockRejectedValue(repoError),
    };
    const useCase = new GetUserUseCase(mockRepo);

    // when: execute({ id: "1" })
    // then: 동일 에러 전파
    await expect(useCase.execute({ id: "1" })).rejects.toThrow("DB connection failed");
    expect(mockRepo.findById).toHaveBeenCalledWith("1");
  });
});
