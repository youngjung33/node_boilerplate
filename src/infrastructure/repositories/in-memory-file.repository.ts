import type { File } from "@/domain/entities/file.entity.js";
import type { IFileRepository } from "@/application/repositories/file.repository.interface.js";

/**
 * In-Memory File Repository 구현체
 */
export class InMemoryFileRepository implements IFileRepository {
  // In-memory 저장소
  private files: Map<string, File> = new Map();
  // ID 생성용 카운터
  private currentId = 1;

  /**
   * ID로 File 조회
   */
  async findById(id: string): Promise<File | null> {
    return this.files.get(id) || null;
  }

  /**
   * 사용자 ID로 File 목록 조회
   */
  async findByUserId(userId: string): Promise<File[]> {
    const results: File[] = [];
    for (const file of this.files.values()) {
      if (file.userId === userId) {
        results.push(file);
      }
    }
    return results;
  }

  /**
   * 새 File 생성
   */
  async create(data: {
    originalName: string;
    fileName: string;
    mimeType: string;
    size: number;
    fileType: File["fileType"];
    compressed: boolean;
    url: string;
    userId: string;
  }): Promise<File> {
    const id = String(this.currentId++);
    const now = new Date();

    const file: File = {
      id,
      originalName: data.originalName,
      fileName: data.fileName,
      mimeType: data.mimeType,
      size: data.size,
      fileType: data.fileType,
      compressed: data.compressed,
      url: data.url,
      userId: data.userId,
      createdAt: now,
    };

    this.files.set(id, file);
    return file;
  }

  /**
   * File 삭제
   */
  async delete(id: string): Promise<void> {
    this.files.delete(id);
  }
}
