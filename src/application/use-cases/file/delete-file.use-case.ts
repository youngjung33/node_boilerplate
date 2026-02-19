import type { IFileRepository } from "@/application/repositories/file.repository.interface.js";
import type { IStorageClient } from "@/application/repositories/storage.interface.js";
import { NotFoundError } from "@/shared/errors/index.js";

/**
 * 파일 삭제 Input
 */
export interface DeleteFileInput {
  // File ID
  fileId: string;
  // 요청한 사용자 ID (권한 체크용)
  userId: string;
}

/**
 * 파일 삭제 Result
 */
export interface DeleteFileResult {
  success: boolean;
}

/**
 * 파일 삭제 Use Case
 */
export class DeleteFileUseCase {
  constructor(
    private readonly fileRepo: IFileRepository,
    private readonly storageClient: IStorageClient
  ) {}

  /**
   * 파일 삭제
   */
  async execute(input: DeleteFileInput): Promise<DeleteFileResult> {
    // DB에서 파일 정보 조회
    const file = await this.fileRepo.findById(input.fileId);

    if (!file) {
      throw new NotFoundError("File not found");
    }

    // 권한 체크 (본인의 파일만 삭제 가능)
    if (file.userId !== input.userId) {
      throw new Error("Unauthorized");
    }

    // S3에서 파일 삭제
    await this.storageClient.deleteFile(file.fileName);

    // DB에서 파일 정보 삭제
    await this.fileRepo.delete(input.fileId);

    return { success: true };
  }
}
