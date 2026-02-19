/**
 * 파일 타입
 */
export type FileType = "image" | "document" | "video" | "other";

/**
 * 파일 엔티티
 */
export interface File {
  // File 고유 식별자
  id: string;
  // 원본 파일명
  originalName: string;
  // 저장된 파일명 (S3 key)
  fileName: string;
  // MIME 타입
  mimeType: string;
  // 파일 크기 (bytes)
  size: number;
  // 파일 타입
  fileType: FileType;
  // 압축 여부
  compressed: boolean;
  // S3 URL
  url: string;
  // 업로드한 사용자 ID
  userId: string;
  // 생성 시각
  createdAt: Date;
}
