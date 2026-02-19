import type { Express } from "express";
import type { IUserRepository } from "@/application/repositories/user.repository.interface.js";
import type { IPaymentRepository } from "@/application/repositories/payment.repository.interface.js";
import type { IFileRepository } from "@/application/repositories/file.repository.interface.js";
import type { IStorageClient } from "@/application/repositories/storage.interface.js";
import { InMemoryUserRepository } from "@/infrastructure/repositories/in-memory-user.repository.js";
import { InMemoryPaymentRepository } from "@/infrastructure/repositories/in-memory-payment.repository.js";
import { InMemoryFileRepository } from "@/infrastructure/repositories/in-memory-file.repository.js";
import { InMemoryStorageClient } from "@/infrastructure/storage/in-memory-storage.client.js";
import { s3Client } from "@/infrastructure/storage/s3.client.js";
import { SqliteUserRepository } from "@/infrastructure/db/sqlite/sqlite-user.repository.js";
import { SupabaseUserRepository } from "@/infrastructure/db/supabase/supabase-user.repository.js";
import { MariaDbUserRepository } from "@/infrastructure/db/mariadb/mariadb-user.repository.js";
import { MongoDbUserRepository } from "@/infrastructure/db/mongodb/mongodb-user.repository.js";
import { GetUserUseCase } from "@/application/use-cases/user/get-user.use-case.js";
import { CreateUserUseCase } from "@/application/use-cases/user/create-user.use-case.js";
import { UpdateUserUseCase } from "@/application/use-cases/user/update-user.use-case.js";
import { DeleteUserUseCase } from "@/application/use-cases/user/delete-user.use-case.js";
import { ListUsersUseCase } from "@/application/use-cases/user/list-users.use-case.js";
import { VerifyStripePaymentUseCase } from "@/application/use-cases/payment/verify-stripe-payment.use-case.js";
import { VerifyGooglePlayPaymentUseCase } from "@/application/use-cases/payment/verify-google-play-payment.use-case.js";
import { VerifyAppleIAPPaymentUseCase } from "@/application/use-cases/payment/verify-apple-iap-payment.use-case.js";
import { RefundPaymentUseCase } from "@/application/use-cases/payment/refund-payment.use-case.js";
import { GetPaymentUseCase } from "@/application/use-cases/payment/get-payment.use-case.js";
import { GetUserPaymentsUseCase } from "@/application/use-cases/payment/get-user-payments.use-case.js";
import { HandleDisputeUseCase } from "@/application/use-cases/payment/handle-dispute.use-case.js";
import { UploadFileUseCase } from "@/application/use-cases/file/upload-file.use-case.js";
import { GetFileUseCase } from "@/application/use-cases/file/get-file.use-case.js";
import { DeleteFileUseCase } from "@/application/use-cases/file/delete-file.use-case.js";
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
 * Payment Repository 생성 (현재는 In-Memory만)
 */
function createPaymentRepository(): IPaymentRepository {
  Logger.info("Creating Payment Repository: in-memory");
  return new InMemoryPaymentRepository();
}

/**
 * File Repository 생성 (현재는 In-Memory만)
 */
function createFileRepository(): IFileRepository {
  Logger.info("Creating File Repository: in-memory");
  return new InMemoryFileRepository();
}

/**
 * Storage Client 생성
 */
function createStorageClient(): IStorageClient {
  if (env.ENABLE_FILE_UPLOAD && env.AWS_S3_BUCKET) {
    Logger.info("Creating Storage Client: S3");
    return s3Client;
  }
  Logger.info("Creating Storage Client: in-memory");
  return new InMemoryStorageClient();
}

/**
 * 의존성 주입(DI) 컨테이너
 * Repository → Use Cases → Express App 순으로 wiring
 * @returns 완전히 wired된 Express 앱
 */
export function createWiredApp(): Express {
  // Infrastructure Layer: Repository 인스턴스 생성
  const userRepository = createUserRepository();
  const paymentRepository = createPaymentRepository();
  const fileRepository = createFileRepository();
  const storageClient = createStorageClient();

  // Application Layer: Use Case 인스턴스 생성 (Repository 주입)
  const useCases = {
    // User Use Cases
    getUser: new GetUserUseCase(userRepository),
    createUser: new CreateUserUseCase(userRepository),
    updateUser: new UpdateUserUseCase(userRepository),
    deleteUser: new DeleteUserUseCase(userRepository),
    listUsers: new ListUsersUseCase(userRepository),
    
    // Payment Use Cases
    verifyStripePayment: new VerifyStripePaymentUseCase(paymentRepository),
    verifyGooglePlayPayment: new VerifyGooglePlayPaymentUseCase(paymentRepository),
    verifyAppleIAPPayment: new VerifyAppleIAPPaymentUseCase(paymentRepository),
    refundPayment: new RefundPaymentUseCase(paymentRepository),
    getPayment: new GetPaymentUseCase(paymentRepository),
    getUserPayments: new GetUserPaymentsUseCase(paymentRepository),
    handleDispute: new HandleDisputeUseCase(paymentRepository),
    
    // File Use Cases
    uploadFile: new UploadFileUseCase(fileRepository, storageClient),
    getFile: new GetFileUseCase(fileRepository, storageClient),
    deleteFile: new DeleteFileUseCase(fileRepository, storageClient),
  };

  // Presentation Layer: Express 앱 생성 (Use Cases 주입)
  return createApp(useCases);
}
