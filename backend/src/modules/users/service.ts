import type { RoleName as PrismaRoleName } from "@prisma/client";
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import { HttpError } from "../../common/exceptions/http-error.js";
import type { JwtPayload } from "../../common/middleware/auth.middleware.js";
import { AuditRepository } from "../audit/repository.js";
import type { CreateUserDto, RolePermissionDto, RoleResponseDto, UpdateRoleDto, UpdateUserDto, UserResponseDto } from "./dto.js";
import { UsersRepository } from "./repository.js";

const scryptAsync = promisify(scrypt);

const ROLE_MAP = {
  Admin: "ADMIN",
  "Sales User": "SALES_USER",
  "Purchase User": "PURCHASE_USER",
  "Manufacturing User": "MANUFACTURING_USER",
  "Inventory Manager": "INVENTORY_MANAGER",
  "Business Owner": "BUSINESS_OWNER",
} as const satisfies Record<string, PrismaRoleName>;

const ROLE_LABELS: Record<PrismaRoleName, keyof typeof ROLE_MAP> = {
  ADMIN: "Admin",
  SALES_USER: "Sales User",
  PURCHASE_USER: "Purchase User",
  MANUFACTURING_USER: "Manufacturing User",
  INVENTORY_MANAGER: "Inventory Manager",
  BUSINESS_OWNER: "Business Owner",
};

const ROLE_DESCRIPTIONS: Record<PrismaRoleName, string> = {
  ADMIN: "Full system access",
  SALES_USER: "Manage customers and sales orders",
  PURCHASE_USER: "Manage vendors and purchase orders",
  MANUFACTURING_USER: "Manage BoMs, manufacturing orders, and work orders",
  INVENTORY_MANAGER: "Track and adjust inventory",
  BUSINESS_OWNER: "Monitor and operate the full business flow except user administration",
};

const MODULES = [
  "Dashboard",
  "Products",
  "Customers",
  "Sales",
  "Vendors",
  "Purchases",
  "Manufacturing",
  "Bill of Materials",
  "Inventory",
  "Procurement",
  "Audit",
  "Users",
] as const;

const ROLE_ACCESS: Record<PrismaRoleName, Partial<Record<(typeof MODULES)[number], Partial<RolePermissionDto>>>> = {
  ADMIN: Object.fromEntries(MODULES.map((module) => [module, { view: true, create: true, edit: true, delete: true, approve: true }])) as any,
  BUSINESS_OWNER: {
    Dashboard: { view: true },
    Products: { view: true, create: true, edit: true },
    Customers: { view: true, create: true, edit: true },
    Sales: { view: true, create: true, edit: true, approve: true },
    Vendors: { view: true, create: true, edit: true },
    Purchases: { view: true, create: true, edit: true, approve: true },
    Manufacturing: { view: true, create: true, edit: true, approve: true },
    "Bill of Materials": { view: true, create: true, edit: true },
    Inventory: { view: true },
    Audit: { view: true },
  },
  SALES_USER: {
    Dashboard: { view: true },
    Products: { view: true },
    Customers: { view: true, create: true, edit: true },
    Sales: { view: true, create: true, edit: true, approve: true },
  },
  PURCHASE_USER: {
    Dashboard: { view: true },
    Products: { view: true },
    Vendors: { view: true, create: true, edit: true },
    Purchases: { view: true, create: true, edit: true, approve: true },
  },
  MANUFACTURING_USER: {
    Dashboard: { view: true },
    Products: { view: true },
    Manufacturing: { view: true, create: true, edit: true, approve: true },
    "Bill of Materials": { view: true, create: true, edit: true },
  },
  INVENTORY_MANAGER: {
    Dashboard: { view: true },
    Products: { view: true },
    Sales: { view: true },
    Purchases: { view: true },
    Inventory: { view: true, create: true, edit: true },
    Procurement: { view: true, create: true, edit: true, approve: true },
  },
};

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const key = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}

function toDto(user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role: { name: PrismaRoleName };
}): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role.name,
    roleLabel: ROLE_LABELS[user.role.name],
    isActive: user.isActive,
  };
}

function resolveRoleName(dto: Pick<CreateUserDto, "role" | "roleName">): PrismaRoleName {
  if (dto.roleName) return dto.roleName;
  if (dto.role) return ROLE_MAP[dto.role];
  throw new HttpError(400, "Role is required");
}

function permissionsForRole(role: PrismaRoleName): RolePermissionDto[] {
  const access = ROLE_ACCESS[role];
  return MODULES.map((module) => ({
    module,
    view: Boolean(access[module]?.view),
    create: Boolean(access[module]?.create),
    edit: Boolean(access[module]?.edit),
    delete: Boolean(access[module]?.delete),
    approve: Boolean(access[module]?.approve),
  }));
}

function parseRoleMetadata(roleName: PrismaRoleName, description: string | null) {
  if (!description) {
    return {
      description: ROLE_DESCRIPTIONS[roleName],
      permissions: permissionsForRole(roleName),
    };
  }

  try {
    const parsed = JSON.parse(description) as { description?: string; permissions?: RolePermissionDto[] };
    return {
      description: parsed.description || ROLE_DESCRIPTIONS[roleName],
      permissions: parsed.permissions?.length ? parsed.permissions : permissionsForRole(roleName),
    };
  } catch {
    return {
      description,
      permissions: permissionsForRole(roleName),
    };
  }
}

function serializeRoleMetadata(description: string, permissions: RolePermissionDto[]) {
  return JSON.stringify({ description, permissions });
}

export class UsersService {
  constructor(
    private readonly repository = new UsersRepository(),
    private readonly auditRepo = new AuditRepository(),
  ) {}

  async list(): Promise<UserResponseDto[]> {
    const users = await this.repository.listUsers();
    return users.map(toDto);
  }

  async roles(): Promise<RoleResponseDto[]> {
    const roles = await this.repository.listRoles();
    return roles.map((role) => {
      const metadata = parseRoleMetadata(role.name, role.description);
      return {
        name: role.name,
        label: ROLE_LABELS[role.name],
        description: metadata.description,
        permissions: metadata.permissions,
      };
    });
  }

  async updateRole(name: PrismaRoleName, dto: UpdateRoleDto, actor?: JwtPayload): Promise<RoleResponseDto> {
    const current = await this.repository.findRoleByName(name);
    const currentMetadata = parseRoleMetadata(current.name, current.description);
    const description = dto.description ?? currentMetadata.description;
    const permissions = dto.permissions ?? currentMetadata.permissions;
    const updated = await this.repository.updateRole(name, serializeRoleMetadata(description, permissions));

    await this.auditRepo.record({
      eventType: "USER_CHANGED",
      entityType: "Role",
      entityId: updated.id,
      summary: `Updated role permissions for ${ROLE_LABELS[name]}`,
      userId: actor?.sub ?? null,
      metadata: { roleName: name, permissions },
    });

    return {
      name: updated.name,
      label: ROLE_LABELS[updated.name],
      description,
      permissions,
    };
  }

  async create(dto: CreateUserDto, actor?: JwtPayload): Promise<UserResponseDto> {
    const password = dto.password ?? "Welcome@123";
    const created = toDto(await this.repository.create({
      ...dto,
      password: await hashPassword(password),
      roleName: resolveRoleName(dto),
    }));

    await this.auditRepo.record({
      eventType: "USER_CHANGED",
      entityType: "User",
      entityId: created.id,
      summary: `Created user ${created.email} as ${created.roleLabel}`,
      userId: actor?.sub ?? null,
      metadata: { email: created.email, roleName: created.role },
    });

    return created;
  }

  async update(id: string, dto: UpdateUserDto, actor?: JwtPayload): Promise<UserResponseDto> {
    const password = dto.password ? await hashPassword(dto.password) : undefined;
    const updated = toDto(await this.repository.update(id, {
      ...dto,
      password,
      roleName: dto.role || dto.roleName ? resolveRoleName(dto) : undefined,
    }));

    await this.auditRepo.record({
      eventType: "USER_CHANGED",
      entityType: "User",
      entityId: updated.id,
      summary: `Updated user ${updated.email}`,
      userId: actor?.sub ?? null,
      metadata: {
        email: updated.email,
        roleName: updated.role,
        isActive: updated.isActive,
        passwordReset: Boolean(dto.password),
      },
    });

    return updated;
  }

  async deactivate(id: string, actor?: JwtPayload): Promise<UserResponseDto> {
    return this.update(id, { isActive: false }, actor);
  }

  async activate(id: string, actor?: JwtPayload): Promise<UserResponseDto> {
    return this.update(id, { isActive: true }, actor);
  }

  async remove(id: string, actor?: JwtPayload): Promise<UserResponseDto> {
    const removed = toDto(await this.repository.softDelete(id));
    await this.auditRepo.record({
      eventType: "USER_CHANGED",
      entityType: "User",
      entityId: removed.id,
      summary: `Deleted user ${removed.email}`,
      userId: actor?.sub ?? null,
      metadata: { email: removed.email, roleName: removed.role },
    });
    return removed;
  }
}
