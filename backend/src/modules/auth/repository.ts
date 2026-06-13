import type { Role, User } from "@prisma/client";
import { prisma } from "../../database/prisma.js";

export type UserWithRole = User & { role: Role };

export class AuthRepository {
  async findUserByEmail(email: string): Promise<UserWithRole | null> {
    return prisma.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null, isActive: true },
      include: { role: true },
    });
  }

  async findRoleByName(name: string): Promise<Role | null> {
    return prisma.role.findFirst({ where: { name: name as any, deletedAt: null } });
  }

  async createUser(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    roleId: string;
  }): Promise<UserWithRole> {
    return prisma.user.create({ data, include: { role: true } });
  }
}
