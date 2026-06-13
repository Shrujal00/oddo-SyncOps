import type { RoleName as DisplayRoleName } from "../../common/constants/rbac.js";
import type { RoleName } from "@prisma/client";

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  role?: DisplayRoleName;
  roleName?: RoleName;
  password?: string;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: DisplayRoleName;
  roleName?: RoleName;
  isActive?: boolean;
  password?: string;
}

export interface UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: RoleName;
  roleLabel: DisplayRoleName;
  isActive: boolean;
}

export interface RolePermissionDto {
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
}

export interface RoleResponseDto {
  name: RoleName;
  label: DisplayRoleName;
  description: string;
  permissions: RolePermissionDto[];
}

export interface UpdateRoleDto {
  description?: string;
  permissions?: RolePermissionDto[];
}
