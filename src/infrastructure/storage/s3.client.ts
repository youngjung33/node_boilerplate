import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { IStorageClient } from "@/application/repositories/storage.interface.js";
import { env } from "../../../config/env.js";
import Logger from "@/shared/logger/logger.js";

/**
 * S3 클라이언트
 */
class S3FileClient implements IStorageClient {
  // S3 Client 인스턴스
  private client: S3Client | null = null;
  // S3 버킷명
  private bucket: string = "";

  /**
   * S3 클라이언트 초기화
   */
  initialize(): void {
    if (!env.ENABLE_FILE_UPLOAD) {
      Logger.info("S3 File Upload is disabled (ENABLE_FILE_UPLOAD=false)");
      return;
    }

    if (!env.AWS_S3_BUCKET || !env.AWS_REGION) {
      Logger.warn("AWS S3 configuration missing, skipping initialization");
      return;
    }

    this.client = new S3Client({
      region: env.AWS_REGION,
      credentials: env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined, // IAM Role 사용 시 credentials 생략
    });

    this.bucket = env.AWS_S3_BUCKET;

    Logger.info(`S3 client initialized: ${this.bucket} (${env.AWS_REGION})`);
  }

  /**
   * 파일 업로드
   */
  async uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<string> {
    if (!this.client) {
      throw new Error("S3 client not initialized");
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    });

    await this.client.send(command);

    // 공개 URL 반환 (버킷이 public인 경우)
    return `https://${this.bucket}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
  }

  /**
   * Signed URL 생성 (파일 다운로드용)
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!this.client) {
      throw new Error("S3 client not initialized");
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await getSignedUrl(this.client, command, { expiresIn });
  }

  /**
   * 파일 삭제
   */
  async deleteFile(key: string): Promise<void> {
    if (!this.client) {
      throw new Error("S3 client not initialized");
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  /**
   * 파일 다운로드
   */
  async downloadFile(key: string): Promise<Buffer> {
    if (!this.client) {
      throw new Error("S3 client not initialized");
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.client.send(command);
    
    // Stream을 Buffer로 변환
    const chunks: Uint8Array[] = [];
    if (response.Body) {
      // @ts-expect-error - Body stream type
      for await (const chunk of response.Body) {
        chunks.push(chunk);
      }
    }
    return Buffer.concat(chunks);
  }
}

// Singleton 인스턴스
export const s3Client = new S3FileClient();
