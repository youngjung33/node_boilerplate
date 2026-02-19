import { describe, it, expect, beforeEach } from "vitest";
import { UploadFileUseCase } from "@/application/use-cases/file/upload-file.use-case.js";
import { InMemoryFileRepository } from "@/infrastructure/repositories/in-memory-file.repository.js";
import { InMemoryStorageClient } from "@/infrastructure/storage/in-memory-storage.client.js";

describe("UploadFileUseCase", () => {
  let fileRepo: InMemoryFileRepository;
  let storageClient: InMemoryStorageClient;
  let useCase: UploadFileUseCase;

  beforeEach(() => {
    fileRepo = new InMemoryFileRepository();
    storageClient = new InMemoryStorageClient();
    useCase = new UploadFileUseCase(fileRepo, storageClient);
  });

  it("파일 업로드 성공", async () => {
    const buffer = Buffer.from("test file content");
    const result = await useCase.execute({
      buffer,
      originalName: "test.txt",
      mimeType: "text/plain",
      size: buffer.length,
      userId: "user-1",
    });

    expect(result.file).toBeDefined();
    expect(result.file.originalName).toBe("test.txt");
    expect(result.file.userId).toBe("user-1");
    expect(result.file.fileType).toBe("document"); // text/plain은 document로 분류됨
    expect(result.compressed).toBe(false);
  });

  it("이미지 파일 타입 판별", async () => {
    const buffer = Buffer.from("fake image data");
    const result = await useCase.execute({
      buffer,
      originalName: "photo.jpg",
      mimeType: "image/jpeg",
      size: buffer.length,
      userId: "user-1",
    });

    expect(result.file.fileType).toBe("image");
  });

  it("비디오 파일 타입 판별", async () => {
    const buffer = Buffer.from("fake video data");
    const result = await useCase.execute({
      buffer,
      originalName: "video.mp4",
      mimeType: "video/mp4",
      size: buffer.length,
      userId: "user-1",
    });

    expect(result.file.fileType).toBe("video");
  });

  it("문서 파일 타입 판별", async () => {
    const buffer = Buffer.from("fake pdf data");
    const result = await useCase.execute({
      buffer,
      originalName: "document.pdf",
      mimeType: "application/pdf",
      size: buffer.length,
      userId: "user-1",
    });

    expect(result.file.fileType).toBe("document");
  });
});
