import { Router } from "express";
import type { GetUserUseCase } from "@/application/use-cases/user/get-user.use-case.js";
import type { CreateUserUseCase } from "@/application/use-cases/user/create-user.use-case.js";
import type { UpdateUserUseCase } from "@/application/use-cases/user/update-user.use-case.js";
import type { DeleteUserUseCase } from "@/application/use-cases/user/delete-user.use-case.js";
import type { ListUsersUseCase } from "@/application/use-cases/user/list-users.use-case.js";

/** User 관련 Use Case 모음 */
export interface UserUseCases {
  getUser: GetUserUseCase;
  createUser: CreateUserUseCase;
  updateUser: UpdateUserUseCase;
  deleteUser: DeleteUserUseCase;
  listUsers: ListUsersUseCase;
}

/**
 * User 라우터 생성
 * @param useCases - User Use Case 인스턴스들
 * @returns Express Router
 */
export function createUserRouter(useCases: UserUseCases): Router {
  const router = Router();

  /**
   * GET /users/:id - User 조회
   */
  router.get("/:id", async (req, res, next) => {
    try {
      const result = await useCases.getUser.execute({ id: req.params.id });
      if (!result.user) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found" } });
        return;
      }
      res.json({ data: result.user });
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /users - User 생성
   */
  router.post("/", async (req, res, next) => {
    try {
      const result = await useCases.createUser.execute(req.body);
      res.status(201).json({ data: result.user });
    } catch (err) {
      next(err);
    }
  });

  /**
   * PATCH /users/:id - User 수정
   */
  router.patch("/:id", async (req, res, next) => {
    try {
      const result = await useCases.updateUser.execute({
        id: req.params.id,
        ...req.body,
      });
      if (!result.user) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found" } });
        return;
      }
      res.json({ data: result.user });
    } catch (err) {
      next(err);
    }
  });

  /**
   * DELETE /users/:id - User 삭제
   */
  router.delete("/:id", async (req, res, next) => {
    try {
      await useCases.deleteUser.execute({ id: req.params.id });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /users - User 목록 조회 (페이지네이션)
   * Query: ?page=1&size=10
   */
  router.get("/", async (req, res, next) => {
    try {
      // 쿼리 파라미터를 숫자로 변환
      const page = parseInt(req.query.page as string, 10) || 1;
      const size = parseInt(req.query.size as string, 10) || 10;
      const result = await useCases.listUsers.execute({ page, size });
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
