import sharp from "sharp";
import type { IFileRepository } from "@/application/repositories/file.repository.interface.js";
import type { IStorageClient } from "@/application/repositories/storage.interface.js";
import type { File } from "@/domain/entities/file.entity.js";
import { env } from "../../../../config/env.js";

/**
 * 파일 업로드 Input
 */
export interface UploadFileInput {
  // 파일 버퍼
  buffer: Buffer;
  // 원본 파일명
  originalName: string;
  // MIME 타입
  mimeType: string;
  // 파일 크기
  size: number;
  // 업로드한 사용자 ID
  userId: string;
}

/**
 * 파일 업로드 Result
 */
export interface UploadFileResult {
  file: File;
  compressed: boolean;
}

/**
 * 파일 업로드 Use Case
 */
export class UploadFileUseCase {
  constructor(
    private readonly fileRepo: IFileRepository,
    private readonly storageClient: IStorageClient
  ) {}

  /**
   * 파일 업로드 (용량 체크 및 압축)
   */
  async execute(input: UploadFileInput): Promise<UploadFileResult> {
    let buffer = input.buffer;
    let compressed = false;
    let finalSize = input.size;

    // 파일 타입 판별
    const fileType = this.determineFileType(input.mimeType);

    // 이미지 파일이고 용량 제한 초과 시 압축
    if (fileType === "image" && input.size > env.FILE_COMPRESS_THRESHOLD) {
      try {
        buffer = await this.compressImage(buffer, input.mimeType);
        compressed = true;
        finalSize = buffer.length;
      } catch (error) {
        // 압축 실패 시 원본 사용
        console.error("Image compression failed, using original:", error);
      }
    }

    // 파일명 생성 (UUID + timestamp)
    const ext = this.getFileExtension(input.originalName);
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;
    const key = `uploads/${input.userId}/${fileName}`;

    // S3 업로드
    const url = await this.storageClient.uploadFile(key, buffer, input.mimeType);

    // DB 저장
    const file = await this.fileRepo.create({
      originalName: input.originalName,
      fileName: key,
      mimeType: input.mimeType,
      size: finalSize,
      fileType,
      compressed,
      url,
      userId: input.userId,
    });

    return { file, compressed };
  }

  /**
   * 파일 타입 판별
   */
  private determineFileType(mimeType: string): File["fileType"] {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (
      mimeType.includes("pdf") ||
      mimeType.includes("document") ||
      mimeType.includes("text")
    ) {
      return "document";
    }
    return "other";
  }

  /**
   * 파일 확장자 추출
   */
  private getFileExtension(filename: string): string {
    const match = filename.match(/\.[^.]+$/);
    return match ? match[0] : "";
  }

  /**
   * 이미지 압축
   */
  private async compressImage(buffer: Buffer, mimeType: string): Promise<Buffer> {
    const image = sharp(buffer);

    // JPEG/PNG 압축
    if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
      return await image.jpeg({ quality: 80 }).toBuffer();
    } else if (mimeType === "image/png") {
      return await image.png({ compressionLevel: 8 }).toBuffer();
    } else if (mimeType === "image/webp") {
      return await image.webp({ quality: 80 }).toBuffer();
    }

    // 기본: JPEG로 변환
    return await image.jpeg({ quality: 80 }).toBuffer();
  }
}
