import type { User } from "@/domain/entities/user.entity.js";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  create(data: { email: string; name: string }): Promise<User>;
  update(id: string, data: { email?: string; name?: string }): Promise<User | null>;
  delete(id: string): Promise<void>;
  list(params: { offset: number; limit: number }): Promise<{ users: User[]; total: number }>;
}
