import { ValidationError } from "@/shared/errors/index.js";

const MAX_ID_LENGTH = 255;
const MAX_EMAIL_LENGTH = 255;
const MAX_NAME_LENGTH = 100;
const RESERVED_IDS = new Set(["null", "undefined"]);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function noControlChars(s: string): boolean {
  return [...s].every((c) => c.charCodeAt(0) > 0x1f);
}

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

export function validateEmail(value: unknown, required: true): string;
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

export function validateName(value: unknown, required: true): string;
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
