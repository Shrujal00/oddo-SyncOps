import type { RoleName } from "../../common/constants/rbac.js";

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  role: RoleName;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  role?: RoleName;
  isActive?: boolean;
}

export interface UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: RoleName;
  isActive: boolean;
}
