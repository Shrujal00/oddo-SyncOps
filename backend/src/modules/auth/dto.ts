export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleName?: string;
}

export interface AuthUserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface LoginResponseDto {
  accessToken: string;
  user: AuthUserDto;
}

export interface ForgotPasswordRequestDto {
  email: string;
}
