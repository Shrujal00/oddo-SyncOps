export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface ForgotPasswordRequestDto {
  email: string;
}
