import type { User } from "@/domain/entities/user.entity.js";
import type { IUserRepository } from "@/application/repositories/user.repository.interface.js";
import { ConflictError } from "@/shared/errors/index.js";

export class InMemoryUserRepository implements IUserRepository {
  private readonly store = new Map<string, User>();
  private idSeq = 1;

  async findById(id: string): Promise<User | null> {
    return this.store.get(id) ?? null;
  }

  async create(data: { email: string; name: string }): Promise<User> {
    for (const u of this.store.values()) {
      if (u.email === data.email) throw new ConflictError("email already exists");
    }
    const id = String(this.idSeq++);
    const user: User = { id, ...data, createdAt: new Date() };
    this.store.set(id, user);
    return user;
  }

  async update(id: string, data: { email?: string; name?: string }): Promise<User | null> {
    const u = this.store.get(id);
    if (!u) return null;
    if (data.email !== undefined) {
      for (const o of this.store.values()) {
        if (o.id !== id && o.email === data.email) throw new ConflictError("email already exists");
      }
      u.email = data.email;
    }
    if (data.name !== undefined) u.name = data.name;
    this.store.set(id, u);
    return u;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  async list(params: { offset: number; limit: number }): Promise<{ users: User[]; total: number }> {
    const all = [...this.store.values()];
    return {
      users: all.slice(params.offset, params.offset + params.limit),
      total: all.length,
    };
  }
}
