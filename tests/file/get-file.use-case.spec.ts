import { describe, it, expect, beforeEach } from "vitest";
import { GetFileUseCase } from "@/application/use-cases/file/get-file.use-case.js";
import { InMemoryFileRepository } from "@/infrastructure/repositories/in-memory-file.repository.js";
import { InMemoryStorageClient } from "@/infrastructure/storage/in-memory-storage.client.js";
import { NotFoundError } from "@/shared/errors/index.js";

describe("GetFileUseCase", () => {
  let fileRepo: InMemoryFileRepository;
  let storageClient: InMemoryStorageClient;
  let useCase: GetFileUseCase;

  beforeEach(() => {
    fileRepo = new InMemoryFileRepository();
    storageClient = new InMemoryStorageClient();
    useCase = new GetFileUseCase(fileRepo, storageClient);
  });

  it("파일이 존재하지 않으면 NotFoundError 발생", async () => {
    await expect(
      useCase.execute({ fileId: "non-existent", generateSignedUrl: true })
    ).rejects.toThrow(NotFoundError);
  });

  it("파일이 존재하면 조회 성공", async () => {
    // 스토리지에 파일 먼저 업로드
    const buffer = Buffer.from("test file content");
    const fileName = "uploads/user-1/test.txt";
    await storageClient.uploadFile(fileName, buffer, "text/plain");

    // DB에 파일 정보 저장
    const file = await fileRepo.create({
      originalName: "test.txt",
      fileName,
      mimeType: "text/plain",
      size: 100,
      fileType: "document",
      compressed: false,
      url: "https://example.com/uploads/user-1/test.txt",
      userId: "user-1",
    });

    const result = await useCase.execute({ fileId: file.id, generateSignedUrl: false });

    expect(result.file).toBeDefined();
    expect(result.file.id).toBe(file.id);
    expect(result.file.originalName).toBe("test.txt");
    expect(result.buffer).toBeDefined();
  });
});
