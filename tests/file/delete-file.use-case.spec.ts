import { describe, it, expect, beforeEach } from "vitest";
import { DeleteFileUseCase } from "@/application/use-cases/file/delete-file.use-case.js";
import { InMemoryFileRepository } from "@/infrastructure/repositories/in-memory-file.repository.js";
import { InMemoryStorageClient } from "@/infrastructure/storage/in-memory-storage.client.js";
import { NotFoundError } from "@/shared/errors/index.js";

describe("DeleteFileUseCase", () => {
  let fileRepo: InMemoryFileRepository;
  let storageClient: InMemoryStorageClient;
  let useCase: DeleteFileUseCase;

  beforeEach(() => {
    fileRepo = new InMemoryFileRepository();
    storageClient = new InMemoryStorageClient();
    useCase = new DeleteFileUseCase(fileRepo, storageClient);
  });

  it("파일이 존재하지 않으면 NotFoundError 발생", async () => {
    await expect(
      useCase.execute({ fileId: "non-existent", userId: "user-1" })
    ).rejects.toThrow(NotFoundError);
  });

  it("다른 사용자의 파일은 삭제 불가", async () => {
    const file = await fileRepo.create({
      originalName: "test.txt",
      fileName: "uploads/user-1/test.txt",
      mimeType: "text/plain",
      size: 100,
      fileType: "other",
      compressed: false,
      url: "https://example.com/uploads/user-1/test.txt",
      userId: "user-1",
    });

    await expect(
      useCase.execute({ fileId: file.id, userId: "user-2" })
    ).rejects.toThrow("Unauthorized");
  });

  it("본인의 파일 삭제 성공", async () => {
    const file = await fileRepo.create({
      originalName: "test.txt",
      fileName: "uploads/user-1/test.txt",
      mimeType: "text/plain",
      size: 100,
      fileType: "other",
      compressed: false,
      url: "https://example.com/uploads/user-1/test.txt",
      userId: "user-1",
    });

    const result = await useCase.execute({ fileId: file.id, userId: "user-1" });

    expect(result.success).toBe(true);

    const deleted = await fileRepo.findById(file.id);
    expect(deleted).toBeNull();
  });
});
