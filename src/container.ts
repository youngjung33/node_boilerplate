import type { Express } from "express";
import type { IUserRepository } from "@/application/repositories/user.repository.interface.js";
import { InMemoryUserRepository } from "@/infrastructure/repositories/in-memory-user.repository.js";
import { SqliteUserRepository } from "@/infrastructure/db/sqlite/sqlite-user.repository.js";
import { SupabaseUserRepository } from "@/infrastructure/db/supabase/supabase-user.repository.js";
import { MariaDbUserRepository } from "@/infrastructure/db/mariadb/mariadb-user.repository.js";
import { MongoDbUserRepository } from "@/infrastructure/db/mongodb/mongodb-user.repository.js";
import { GetUserUseCase } from "@/application/use-cases/user/get-user.use-case.js";
import { CreateUserUseCase } from "@/application/use-cases/user/create-user.use-case.js";
import { UpdateUserUseCase } from "@/application/use-cases/user/update-user.use-case.js";
import { DeleteUserUseCase } from "@/application/use-cases/user/delete-user.use-case.js";
import { ListUsersUseCase } from "@/application/use-cases/user/list-users.use-case.js";
import { createApp } from "@/presentation/app.js";
import { env } from "../config/env.js";
import Logger from "@/shared/logger/logger.js";

/**
 * DB_TYPE에 따라 User Repository 생성
 */
function createUserRepository(): IUserRepository {
  const dbType = env.DB_TYPE;
  Logger.info(`Creating User Repository: ${dbType}`);

  switch (dbType) {
    case "memory":
      return new InMemoryUserRepository();
    
    case "sqlite":
      return new SqliteUserRepository();
    
    case "supabase":
      return new SupabaseUserRepository();
    
    case "mariadb":
      return new MariaDbUserRepository();
    
    case "mongodb":
      return new MongoDbUserRepository();
    
    default:
      throw new Error(`Unsupported DB_TYPE: ${dbType}`);
  }
}

/**
 * 의존성 주입(DI) 컨테이너
 * Repository → Use Cases → Express App 순으로 wiring
 * @returns 완전히 wired된 Express 앱
 */
export function createWiredApp(): Express {
  // Infrastructure Layer: Repository 인스턴스 생성 (DB_TYPE에 따라)
  const userRepository = createUserRepository();

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
