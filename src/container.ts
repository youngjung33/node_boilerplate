import type { Express } from "express";
import { InMemoryUserRepository } from "@/infrastructure/repositories/in-memory-user.repository.js";
import { GetUserUseCase } from "@/application/use-cases/user/get-user.use-case.js";
import { CreateUserUseCase } from "@/application/use-cases/user/create-user.use-case.js";
import { UpdateUserUseCase } from "@/application/use-cases/user/update-user.use-case.js";
import { DeleteUserUseCase } from "@/application/use-cases/user/delete-user.use-case.js";
import { ListUsersUseCase } from "@/application/use-cases/user/list-users.use-case.js";
import { createApp } from "@/presentation/app.js";

/**
 * 의존성 주입(DI) 컨테이너
 * Repository → Use Cases → Express App 순으로 wiring
 * @returns 완전히 wired된 Express 앱
 */
export function createWiredApp(): Express {
  // Infrastructure Layer: Repository 인스턴스 생성
  const userRepository = new InMemoryUserRepository();

  // Application Layer: Use Case 인스턴스 생성 (Repository 주입)
  const useCases = {
    getUser: new GetUserUseCase(userRepository),
    createUser: new CreateUserUseCase(userRepository),
    updateUser: new UpdateUserUseCase(userRepository),
    deleteUser: new DeleteUserUseCase(userRepository),
    listUsers: new ListUsersUseCase(userRepository),
  };

  // Presentation Layer: Express 앱 생성 (Use Cases 주입)
  return createApp(useCases);
}
