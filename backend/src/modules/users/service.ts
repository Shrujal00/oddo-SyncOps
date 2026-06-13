import type { RoleName as PrismaRoleName } from "@prisma/client";
import type { CreateUserDto, UpdateUserDto, UserResponseDto } from "./dto.js";
import { UsersRepository } from "./repository.js";

const ROLE_MAP: Record<CreateUserDto["role"], PrismaRoleName> = {
  Admin: "ADMIN",
  "Sales User": "SALES_USER",
  "Purchase User": "PURCHASE_USER",
  "Manufacturing User": "MANUFACTURING_USER",
  "Inventory Manager": "INVENTORY_MANAGER",
  "Business Owner": "BUSINESS_OWNER",
};

function toDto(user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role: { name: PrismaRoleName };
}): UserResponseDto {
  const role = (Object.entries(ROLE_MAP).find(([, value]) => value === user.role.name)?.[0] ?? "Sales User") as CreateUserDto["role"];
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role,
    isActive: user.isActive,
  };
}

export class UsersService {
  constructor(private readonly repository = new UsersRepository()) {}

  async list(): Promise<UserResponseDto[]> {
    const users = await this.repository.listUsers();
    return users.map(toDto);
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    return toDto(await this.repository.create({ ...dto, roleName: ROLE_MAP[dto.role] }));
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    return toDto(await this.repository.update(id, {
      ...dto,
      roleName: dto.role ? ROLE_MAP[dto.role] : undefined,
    }));
  }
}
