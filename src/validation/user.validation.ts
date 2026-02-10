import { z } from "zod";
import { ValidationError } from "@/shared/errors/index.js";

/**
 * 제어 문자 체크 커스텀 refinement
 */
const noControlChars = (val: string) => {
  return [...val].every((c) => c.charCodeAt(0) > 0x1f);
};

/**
 * User ID 스키마
 */
export const userIdSchema = z
  .string()
  .trim()
  .min(1, "id must not be empty")
  .max(255, "id must not exceed 255 characters")
  .refine((val) => !["null", "undefined"].includes(val), {
    message: "id is reserved",
  })
  .refine(noControlChars, {
    message: "id must not contain control characters",
  });

/**
 * Email 스키마
 */
export const emailSchema = z
  .string()
  .trim()
  .min(1, "email must not be empty")
  .max(255, "email must not exceed 255 characters")
  .email("email format is invalid")
  .refine(noControlChars, {
    message: "email must not contain control characters",
  });

/**
 * Name 스키마
 */
export const nameSchema = z
  .string()
  .trim()
  .min(1, "name must not be empty")
  .max(100, "name must not exceed 100 characters")
  .refine(noControlChars, {
    message: "name must not contain control characters",
  });

/**
 * 페이지네이션 스키마
 */
export const paginationSchema = z.object({
  page: z
    .number()
    .int("page must be an integer")
    .min(1, "page must be >= 1"),
  size: z
    .number()
    .int("size must be an integer")
    .min(1, "size must be >= 1")
    .max(100, "size must not exceed 100"),
});

/**
 * CreateUser 입력 스키마
 */
export const createUserSchema = z.object({
  email: emailSchema,
  name: nameSchema,
});

/**
 * UpdateUser 입력 스키마
 */
export const updateUserSchema = z
  .object({
    id: userIdSchema,
    email: emailSchema.optional(),
    name: nameSchema.optional(),
  })
  .refine((data) => data.email !== undefined || data.name !== undefined, {
    message: "at least one of email or name must be provided",
  });

/**
 * GetUser 입력 스키마
 */
export const getUserSchema = z.object({
  id: userIdSchema,
});

/**
 * DeleteUser 입력 스키마
 */
export const deleteUserSchema = z.object({
  id: userIdSchema,
});

/**
 * ListUsers 입력 스키마
 */
export const listUsersSchema = paginationSchema;

/**
 * Zod 에러를 ValidationError로 변환
 */
export function parseWithZod<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    // Zod 에러의 첫 번째 이슈 메시지 추출
    const firstIssue = result.error.issues?.[0];
    const message = firstIssue?.message || "Validation failed";
    throw new ValidationError(message);
  }
  return result.data;
}

/**
 * User ID 검증
 */
export function validateUserId(id: unknown): string {
  return parseWithZod(userIdSchema, id);
}

/**
 * 페이지네이션 검증
 */
export function validatePageSize(page: unknown, size: unknown): { page: number; size: number } {
  return parseWithZod(paginationSchema, { page, size });
}
