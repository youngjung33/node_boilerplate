import Database from "better-sqlite3";
import type { User } from "@/domain/entities/user.entity.js";
import type { IUserRepository } from "@/application/repositories/user.repository.interface.js";
import { ConflictError } from "@/shared/errors/index.js";
import { env } from "../../../../config/env.js";
import Logger from "@/shared/logger/logger.js";
import * as fs from "fs";
import * as path from "path";

/**
 * SQLite User Repository 구현체
 */
export class SqliteUserRepository implements IUserRepository {
  // SQLite DB 인스턴스
  private db: Database.Database;

  constructor() {
    // 데이터 디렉토리 생성
    const dbPath = env.DB_SQLITE_PATH;
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // SQLite DB 연결
    this.db = new Database(dbPath);
    Logger.info(`SQLite connected: ${dbPath}`);

    // 테이블 생성
    this.createTable();
  }

  /**
   * users 테이블 생성
   */
  private createTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);
  }

  /**
   * ID로 User 조회
   */
  async findById(id: string): Promise<User | null> {
    const row = this.db.prepare("SELECT * FROM users WHERE id = ?").get(id) as any;
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      createdAt: new Date(row.created_at),
    };
  }

  /**
   * 새 User 생성
   */
  async create(data: { email: string; name: string }): Promise<User> {
    // 이메일 중복 체크
    const existing = this.db.prepare("SELECT id FROM users WHERE email = ?").get(data.email);
    if (existing) throw new ConflictError("email already exists");

    // ID 생성 (UUID 대신 간단하게 timestamp 사용)
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    this.db
      .prepare("INSERT INTO users (id, email, name, created_at) VALUES (?, ?, ?, ?)")
      .run(id, data.email, data.name, createdAt);

    return {
      id,
      email: data.email,
      name: data.name,
      createdAt: new Date(createdAt),
    };
  }

  /**
   * User 정보 수정
   */
  async update(id: string, data: { email?: string; name?: string }): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;

    // 이메일 중복 체크 (자기 자신 제외)
    if (data.email !== undefined) {
      const existing = this.db
        .prepare("SELECT id FROM users WHERE email = ? AND id != ?")
        .get(data.email, id);
      if (existing) throw new ConflictError("email already exists");
    }

    // UPDATE 쿼리 동적 생성
    const updates: string[] = [];
    const values: any[] = [];

    if (data.email !== undefined) {
      updates.push("email = ?");
      values.push(data.email);
    }
    if (data.name !== undefined) {
      updates.push("name = ?");
      values.push(data.name);
    }

    if (updates.length > 0) {
      values.push(id);
      this.db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    }

    return await this.findById(id);
  }

  /**
   * User 삭제
   */
  async delete(id: string): Promise<void> {
    this.db.prepare("DELETE FROM users WHERE id = ?").run(id);
  }

  /**
   * User 목록 조회 (페이지네이션)
   */
  async list(params: { offset: number; limit: number }): Promise<{ users: User[]; total: number }> {
    const rows = this.db
      .prepare("SELECT * FROM users LIMIT ? OFFSET ?")
      .all(params.limit, params.offset) as any[];

    const totalRow = this.db.prepare("SELECT COUNT(*) as count FROM users").get() as any;

    const users: User[] = rows.map((row) => ({
      id: row.id,
      email: row.email,
      name: row.name,
      createdAt: new Date(row.created_at),
    }));

    return { users, total: totalRow.count };
  }
}
