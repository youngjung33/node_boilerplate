import mysql from "mysql2/promise";
import type { User } from "@/domain/entities/user.entity.js";
import type { IUserRepository } from "@/application/repositories/user.repository.interface.js";
import { ConflictError } from "@/shared/errors/index.js";
import { env } from "../../../../config/env.js";
import Logger from "@/shared/logger/logger.js";

/**
 * MariaDB User Repository 구현체
 */
export class MariaDbUserRepository implements IUserRepository {
  // Connection Pool
  private pool: mysql.Pool;

  constructor() {
    this.pool = mysql.createPool({
      host: env.DB_MARIADB_HOST,
      port: env.DB_MARIADB_PORT,
      user: env.DB_MARIADB_USER,
      password: env.DB_MARIADB_PASSWORD,
      database: env.DB_MARIADB_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    Logger.info(`MariaDB connected: ${env.DB_MARIADB_HOST}:${env.DB_MARIADB_PORT}/${env.DB_MARIADB_DATABASE}`);
    
    // 테이블 생성
    this.createTable();
  }

  /**
   * users 테이블 생성
   */
  private async createTable(): Promise<void> {
    const conn = await this.pool.getConnection();
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          name VARCHAR(100) NOT NULL,
          created_at DATETIME NOT NULL,
          INDEX idx_email (email)
        )
      `);
    } finally {
      conn.release();
    }
  }

  /**
   * ID로 User 조회
   */
  async findById(id: string): Promise<User | null> {
    const [rows] = await this.pool.query("SELECT * FROM users WHERE id = ?", [id]);
    const results = rows as any[];
    
    if (results.length === 0) return null;

    const row = results[0];
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
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date();

    try {
      await this.pool.query(
        "INSERT INTO users (id, email, name, created_at) VALUES (?, ?, ?, ?)",
        [id, data.email, data.name, createdAt]
      );
    } catch (error: any) {
      // 이메일 중복 에러 (MySQL error code 1062)
      if (error.code === "ER_DUP_ENTRY") {
        throw new ConflictError("email already exists");
      }
      throw error;
    }

    return {
      id,
      email: data.email,
      name: data.name,
      createdAt,
    };
  }

  /**
   * User 정보 수정
   */
  async update(id: string, data: { email?: string; name?: string }): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;

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

    if (updates.length === 0) return user;

    values.push(id);

    try {
      await this.pool.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values);
    } catch (error: any) {
      // 이메일 중복 에러
      if (error.code === "ER_DUP_ENTRY") {
        throw new ConflictError("email already exists");
      }
      throw error;
    }

    return await this.findById(id);
  }

  /**
   * User 삭제
   */
  async delete(id: string): Promise<void> {
    await this.pool.query("DELETE FROM users WHERE id = ?", [id]);
  }

  /**
   * User 목록 조회 (페이지네이션)
   */
  async list(params: { offset: number; limit: number }): Promise<{ users: User[]; total: number }> {
    // 전체 개수 조회
    const [countRows] = await this.pool.query("SELECT COUNT(*) as count FROM users");
    const total = (countRows as any[])[0].count;

    // 페이지네이션 조회
    const [rows] = await this.pool.query("SELECT * FROM users LIMIT ? OFFSET ?", [
      params.limit,
      params.offset,
    ]);

    const users: User[] = (rows as any[]).map((row) => ({
      id: row.id,
      email: row.email,
      name: row.name,
      createdAt: new Date(row.created_at),
    }));

    return { users, total };
  }
}
