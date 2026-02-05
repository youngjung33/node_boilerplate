import { ValidationError } from "@/shared/errors/index.js";

// ID 최대 길이
const MAX_ID_LENGTH = 255;
// 이메일 최대 길이
const MAX_EMAIL_LENGTH = 255;
// 이름 최대 길이
const MAX_NAME_LENGTH = 100;
// 예약된 ID (사용 금지)
const RESERVED_IDS = new Set(["null", "undefined"]);
// 이메일 형식 정규식
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 제어 문자(control character) 체크
 * @param s - 검사할 문자열
 * @returns 제어 문자가 없으면 true
 */
function noControlChars(s: string): boolean {
  return [...s].every((c) => c.charCodeAt(0) > 0x1f);
}

/**
 * User ID 검증
 * @param id - 검증할 ID
 * @returns 정제된 ID
 * @throws ValidationError - ID가 유효하지 않을 경우
 */
export function validateUserId(id: unknown): string {
  if (id === undefined || id === null || typeof id !== "string") {
    throw new ValidationError("id is required");
  }
  const t = id.trim();
  if (!t.length) throw new ValidationError("id must not be empty");
  if (t.length > MAX_ID_LENGTH) throw new ValidationError("id must not exceed 255 characters");
  if (RESERVED_IDS.has(t)) throw new ValidationError("id is reserved");
  if (!noControlChars(t)) throw new ValidationError("id must not contain control characters");
  return t;
}

/**
 * 이메일 검증 (필수)
 * @param value - 검증할 이메일
 * @param required - 필수 여부
 * @returns 정제된 이메일
 * @throws ValidationError - 이메일이 유효하지 않을 경우
 */
export function validateEmail(value: unknown, required: true): string;
/**
 * 이메일 검증 (선택)
 * @param value - 검증할 이메일
 * @param required - 필수 여부
 * @returns 정제된 이메일 또는 undefined
 * @throws ValidationError - 이메일이 유효하지 않을 경우
 */
export function validateEmail(value: unknown, required: false): string | undefined;
export function validateEmail(value: unknown, required: boolean): string | undefined {
  if (value === undefined || value === null) {
    if (required) throw new ValidationError("email is required");
    return undefined;
  }
  if (typeof value !== "string") {
    if (required) throw new ValidationError("email is required");
    throw new ValidationError("email must be a string");
  }
  const t = value.trim();
  if (required && !t.length) throw new ValidationError("email must not be empty");
  if (t.length) {
    if (t.length > MAX_EMAIL_LENGTH) throw new ValidationError("email must not exceed 255 characters");
    if (!EMAIL_REGEX.test(t)) throw new ValidationError("email format is invalid");
    if (!noControlChars(t)) throw new ValidationError("email must not contain control characters");
  }
  return t.length ? t : undefined;
}

/**
 * 이름 검증 (필수)
 * @param value - 검증할 이름
 * @param required - 필수 여부
 * @returns 정제된 이름
 * @throws ValidationError - 이름이 유효하지 않을 경우
 */
export function validateName(value: unknown, required: true): string;
/**
 * 이름 검증 (선택)
 * @param value - 검증할 이름
 * @param required - 필수 여부
 * @returns 정제된 이름 또는 undefined
 * @throws ValidationError - 이름이 유효하지 않을 경우
 */
export function validateName(value: unknown, required: false): string | undefined;
export function validateName(value: unknown, required: boolean): string | undefined {
  if (value === undefined || value === null) {
    if (required) throw new ValidationError("name is required");
    return undefined;
  }
  if (typeof value !== "string") {
    if (required) throw new ValidationError("name is required");
    throw new ValidationError("name must be a string");
  }
  const t = value.trim();
  if (required && !t.length) throw new ValidationError("name must not be empty");
  if (t.length) {
    if (t.length > MAX_NAME_LENGTH) throw new ValidationError("name must not exceed 100 characters");
    if (!noControlChars(t)) throw new ValidationError("name must not contain control characters");
  }
  return t.length ? t : undefined;
}

/**
 * 페이지네이션 파라미터 검증
 * @param page - 페이지 번호 (1부터 시작)
 * @param size - 페이지 크기 (1~100)
 * @returns 검증된 page, size
 * @throws ValidationError - 파라미터가 유효하지 않을 경우
 */
export function validatePageSize(page: unknown, size: unknown): { page: number; size: number } {
  if (page === undefined || page === null) throw new ValidationError("page is required");
  if (typeof page !== "number" || Number.isNaN(page)) throw new ValidationError("page must be a number");
  if (page < 1 || !Number.isInteger(page)) throw new ValidationError("page must be an integer >= 1");
  if (size === undefined || size === null) throw new ValidationError("size is required");
  if (typeof size !== "number" || Number.isNaN(size)) throw new ValidationError("size must be a number");
  if (size < 1 || !Number.isInteger(size)) throw new ValidationError("size must be an integer >= 1");
  if (size > 100) throw new ValidationError("size must not exceed 100");
  return { page, size };
}
