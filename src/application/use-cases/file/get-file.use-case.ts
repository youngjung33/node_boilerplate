import type { IFileRepository } from "@/application/repositories/file.repository.interface.js";
import type { IStorageClient } from "@/application/repositories/storage.interface.js";
import type { File } from "@/domain/entities/file.entity.js";
import { NotFoundError } from "@/shared/errors/index.js";

/**
 * 파일 조회 Input
 */
export interface GetFileInput {
  // File ID
  fileId: string;
  // Signed URL 생성 여부 (true: presigned URL, false: 파일 다운로드)
  generateSignedUrl?: boolean;
}

/**
 * 파일 조회 Result
 */
export interface GetFileResult {
  file: File;
  signedUrl?: string;
  buffer?: Buffer;
}

/**
 * 파일 조회 Use Case
 */
export class GetFileUseCase {
  constructor(
    private readonly fileRepo: IFileRepository,
    private readonly storageClient: IStorageClient
  ) {}

  /**
   * 파일 조회
   */
  async execute(input: GetFileInput): Promise<GetFileResult> {
    // DB에서 파일 정보 조회
    const file = await this.fileRepo.findById(input.fileId);

    if (!file) {
      throw new NotFoundError("File not found");
    }

    // Signed URL 생성
    if (input.generateSignedUrl) {
      const signedUrl = await this.storageClient.getSignedUrl(file.fileName, 3600); // 1시간 유효
      return { file, signedUrl };
    }

    // 파일 다운로드
    const buffer = await this.storageClient.downloadFile(file.fileName);
    return { file, buffer };
  }
}
