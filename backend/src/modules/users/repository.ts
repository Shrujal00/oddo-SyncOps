import type { RoleName } from "@prisma/client";
import { HttpError } from "../../common/exceptions/http-error.js";
import { prisma } from "../../database/prisma.js";
import type { CreateUserDto, UpdateUserDto } from "./dto.js";

export class UsersRepository {
  listUsers() {
    return prisma.user.findMany({
      where: { deletedAt: null },
      include: { role: true },
      orderBy: { email: "asc" },
    });
  }

  async findById(id: string) {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { role: true },
    });
    if (!user) throw new HttpError(404, "User not found");
    return user;
  }

  async findRoleByName(name: RoleName) {
    const role = await prisma.role.findUnique({ where: { name } });
    if (!role) throw new HttpError(400, "Role not found");
    return role;
  }

  async create(dto: CreateUserDto & { roleName: RoleName }) {
    const role = await this.findRoleByName(dto.roleName);
    return prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        firstName: dto.firstName,
        lastName: dto.lastName,
        roleId: role.id,
        passwordHash: "created-from-users-module:password-reset-required",
      },
      include: { role: true },
    });
  }

  async update(id: string, dto: UpdateUserDto & { roleName?: RoleName }) {
    await this.findById(id);
    const role = dto.roleName ? await this.findRoleByName(dto.roleName) : null;
    return prisma.user.update({
      where: { id },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(role && { roleId: role.id }),
      },
      include: { role: true },
    });
  }
}
