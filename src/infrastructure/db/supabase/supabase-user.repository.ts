import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@/domain/entities/user.entity.js";
import type { IUserRepository } from "@/application/repositories/user.repository.interface.js";
import { ConflictError } from "@/shared/errors/index.js";
import { env } from "../../../../config/env.js";
import Logger from "@/shared/logger/logger.js";

/**
 * Supabase User Repository 구현체
 */
export class SupabaseUserRepository implements IUserRepository {
  // Supabase 클라이언트
  private supabase: SupabaseClient;

  constructor() {
    if (!env.DB_SUPABASE_URL || !env.DB_SUPABASE_KEY) {
      throw new Error("Supabase URL and KEY are required");
    }

    this.supabase = createClient(env.DB_SUPABASE_URL, env.DB_SUPABASE_KEY);
    Logger.info("Supabase connected");
  }

  /**
   * ID로 User 조회
   */
  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      createdAt: new Date(data.created_at),
    };
  }

  /**
   * 새 User 생성
   */
  async create(data: { email: string; name: string }): Promise<User> {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    const { data: inserted, error } = await this.supabase
      .from("users")
      .insert({
        id,
        email: data.email,
        name: data.name,
        created_at: createdAt,
      })
      .select()
      .single();

    if (error) {
      // 이메일 중복 에러 체크
      if (error.code === "23505" || error.message.includes("duplicate")) {
        throw new ConflictError("email already exists");
      }
      throw new Error(error.message);
    }

    return {
      id: inserted.id,
      email: inserted.email,
      name: inserted.name,
      createdAt: new Date(inserted.created_at),
    };
  }

  /**
   * User 정보 수정
   */
  async update(id: string, data: { email?: string; name?: string }): Promise<User | null> {
    const updates: any = {};
    if (data.email !== undefined) updates.email = data.email;
    if (data.name !== undefined) updates.name = data.name;

    const { data: updated, error } = await this.supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      // 이메일 중복 에러 체크
      if (error.code === "23505" || error.message.includes("duplicate")) {
        throw new ConflictError("email already exists");
      }
      return null;
    }

    if (!updated) return null;

    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      createdAt: new Date(updated.created_at),
    };
  }

  /**
   * User 삭제
   */
  async delete(id: string): Promise<void> {
    await this.supabase.from("users").delete().eq("id", id);
  }

  /**
   * User 목록 조회 (페이지네이션)
   */
  async list(params: { offset: number; limit: number }): Promise<{ users: User[]; total: number }> {
    // 전체 개수 조회
    const { count } = await this.supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    // 페이지네이션 조회
    const { data, error } = await this.supabase
      .from("users")
      .select("*")
      .range(params.offset, params.offset + params.limit - 1);

    if (error) throw new Error(error.message);

    const users: User[] = (data || []).map((row) => ({
      id: row.id,
      email: row.email,
      name: row.name,
      createdAt: new Date(row.created_at),
    }));

    return { users, total: count || 0 };
  }
}
