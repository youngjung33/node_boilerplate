import { Router } from "express";
import multer from "multer";
import type { UploadFileUseCase } from "@/application/use-cases/file/upload-file.use-case.js";
import type { GetFileUseCase } from "@/application/use-cases/file/get-file.use-case.js";
import type { DeleteFileUseCase } from "@/application/use-cases/file/delete-file.use-case.js";
import { env } from "../../../config/env.js";
import Logger from "@/shared/logger/logger.js";

/**
 * File Use Cases 타입
 */
export interface FileUseCases {
  uploadFile: UploadFileUseCase;
  getFile: GetFileUseCase;
  deleteFile: DeleteFileUseCase;
}

/**
 * Multer 설정 (메모리 저장소)
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.FILE_SIZE_LIMIT, // 최대 파일 크기
  },
  fileFilter: (req, file, cb) => {
    // 허용된 MIME 타입 체크 (선택사항)
    const allowedMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain", // 텍스트 파일 추가
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

/**
 * File 라우터 생성
 */
export function createFileRouter(useCases: FileUseCases): Router {
  const router = Router();

  /**
   * 파일 업로드
   * POST /upload
   */
  router.post("/upload", upload.single("file"), async (req, res, next) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      // 임시로 userId 사용 (실제로는 JWT 미들웨어에서 가져와야 함)
      const userId = req.body.userId || "anonymous";

      const result = await useCases.uploadFile.execute({
        buffer: req.file.buffer,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        userId,
      });

      Logger.info(`File uploaded: ${result.file.id} (compressed: ${result.compressed})`);

      res.json({
        data: {
          ...result.file,
          compressed: result.compressed,
        },
        meta: {},
      });
    } catch (err) {
      Logger.error("File upload error", err);
      next(err);
    }
  });

  /**
   * 파일 조회 (Signed URL 반환)
   * GET /:fileId
   */
  router.get("/:fileId", async (req, res, next) => {
    try {
      const { fileId } = req.params;

      const result = await useCases.getFile.execute({
        fileId,
        generateSignedUrl: true, // Signed URL 생성
      });

      res.json({
        data: {
          file: result.file,
          signedUrl: result.signedUrl,
        },
        meta: {},
      });
    } catch (err) {
      next(err);
    }
  });

  /**
   * 파일 다운로드
   * GET /:fileId/download
   */
  router.get("/:fileId/download", async (req, res, next) => {
    try {
      const { fileId } = req.params;

      const result = await useCases.getFile.execute({
        fileId,
        generateSignedUrl: false, // 파일 다운로드
      });

      if (!result.buffer) {
        res.status(500).json({ error: "Failed to download file" });
        return;
      }

      // Content-Type 및 Content-Disposition 설정
      res.setHeader("Content-Type", result.file.mimeType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(result.file.originalName)}"`
      );
      res.send(result.buffer);
    } catch (err) {
      next(err);
    }
  });

  /**
   * 파일 삭제
   * DELETE /:fileId
   */
  router.delete("/:fileId", async (req, res, next) => {
    try {
      const { fileId } = req.params;
      // 임시로 userId 사용 (실제로는 JWT 미들웨어에서 가져와야 함)
      const userId = req.body.userId || "anonymous";

      await useCases.deleteFile.execute({
        fileId,
        userId,
      });

      Logger.info(`File deleted: ${fileId}`);

      res.json({
        data: { success: true },
        meta: {},
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
