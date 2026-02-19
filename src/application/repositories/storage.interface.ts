/**
 * Storage Client 인터페이스
 */
export interface IStorageClient {
  /**
   * 파일 업로드
   */
  uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<string>;

  /**
   * Signed URL 생성
   */
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;

  /**
   * 파일 삭제
   */
  deleteFile(key: string): Promise<void>;

  /**
   * 파일 다운로드
   */
  downloadFile(key: string): Promise<Buffer>;
}
