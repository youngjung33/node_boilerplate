import type { File } from "@/domain/entities/file.entity.js";

/**
 * File Repository 인터페이스
 */
export interface IFileRepository {
  /**
   * ID로 File 조회
   */
  findById(id: string): Promise<File | null>;

  /**
   * 사용자 ID로 File 목록 조회
   */
  findByUserId(userId: string): Promise<File[]>;

  /**
   * 새 File 생성
   */
  create(data: {
    originalName: string;
    fileName: string;
    mimeType: string;
    size: number;
    fileType: File["fileType"];
    compressed: boolean;
    url: string;
    userId: string;
  }): Promise<File>;

  /**
   * File 삭제
   */
  delete(id: string): Promise<void>;
}
