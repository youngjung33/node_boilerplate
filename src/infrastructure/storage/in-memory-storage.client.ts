import type { IStorageClient } from "@/application/repositories/storage.interface.js";

/**
 * In-Memory Storage 구현체 (테스트용)
 */
export class InMemoryStorageClient implements IStorageClient {
  // In-memory 저장소
  private files: Map<string, Buffer> = new Map();

  /**
   * 파일 업로드
   */
  async uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<string> {
    this.files.set(key, buffer);
    return `https://fake-s3.com/${key}`;
  }

  /**
   * Signed URL 생성
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    return `https://fake-s3.com/${key}?expires=${expiresIn}`;
  }

  /**
   * 파일 삭제
   */
  async deleteFile(key: string): Promise<void> {
    this.files.delete(key);
  }

  /**
   * 파일 다운로드
   */
  async downloadFile(key: string): Promise<Buffer> {
    const buffer = this.files.get(key);
    if (!buffer) {
      throw new Error("File not found");
    }
    return buffer;
  }
}
