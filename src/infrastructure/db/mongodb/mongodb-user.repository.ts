import { MongoClient, type Db, type Collection, ObjectId } from "mongodb";
import type { User } from "@/domain/entities/user.entity.js";
import type { IUserRepository } from "@/application/repositories/user.repository.interface.js";
import { ConflictError } from "@/shared/errors/index.js";
import { env } from "../../../../config/env.js";
import Logger from "@/shared/logger/logger.js";

/**
 * MongoDB User Repository 구현체
 */
export class MongoDbUserRepository implements IUserRepository {
  // MongoDB 클라이언트
  private client: MongoClient;
  // DB 인스턴스
  private db!: Db;
  // users 컬렉션
  private collection!: Collection;

  constructor() {
    this.client = new MongoClient(env.DB_MONGODB_URI);
    this.connect();
  }

  /**
   * MongoDB 연결
   */
  private async connect(): Promise<void> {
    await this.client.connect();
    this.db = this.client.db();
    this.collection = this.db.collection("users");

    // 이메일 unique 인덱스 생성
    await this.collection.createIndex({ email: 1 }, { unique: true });

    Logger.info(`MongoDB connected: ${env.DB_MONGODB_URI}`);
  }

  /**
   * ID로 User 조회
   */
  async findById(id: string): Promise<User | null> {
    const doc = await this.collection.findOne({ id });
    if (!doc) return null;

    return {
      id: doc.id,
      email: doc.email,
      name: doc.name,
      createdAt: new Date(doc.createdAt),
    };
  }

  /**
   * 새 User 생성
   */
  async create(data: { email: string; name: string }): Promise<User> {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date();

    try {
      await this.collection.insertOne({
        id,
        email: data.email,
        name: data.name,
        createdAt: createdAt.toISOString(),
      });
    } catch (error: any) {
      // 이메일 중복 에러 (MongoDB error code 11000)
      if (error.code === 11000) {
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
    const updates: any = {};
    if (data.email !== undefined) updates.email = data.email;
    if (data.name !== undefined) updates.name = data.name;

    if (Object.keys(updates).length === 0) {
      return await this.findById(id);
    }

    try {
      const result = await this.collection.findOneAndUpdate(
        { id },
        { $set: updates },
        { returnDocument: "after" }
      );

      if (!result) return null;

      return {
        id: result.id,
        email: result.email,
        name: result.name,
        createdAt: new Date(result.createdAt),
      };
    } catch (error: any) {
      // 이메일 중복 에러
      if (error.code === 11000) {
        throw new ConflictError("email already exists");
      }
      throw error;
    }
  }

  /**
   * User 삭제
   */
  async delete(id: string): Promise<void> {
    await this.collection.deleteOne({ id });
  }

  /**
   * User 목록 조회 (페이지네이션)
   */
  async list(params: { offset: number; limit: number }): Promise<{ users: User[]; total: number }> {
    const total = await this.collection.countDocuments();

    const docs = await this.collection
      .find()
      .skip(params.offset)
      .limit(params.limit)
      .toArray();

    const users: User[] = docs.map((doc) => ({
      id: doc.id,
      email: doc.email,
      name: doc.name,
      createdAt: new Date(doc.createdAt),
    }));

    return { users, total };
  }
}
