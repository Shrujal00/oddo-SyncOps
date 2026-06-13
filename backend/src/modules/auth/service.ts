import { notImplemented } from "../../common/exceptions/not-implemented.js";
import type { ForgotPasswordRequestDto, LoginRequestDto, LoginResponseDto } from "./dto.js";
import { AuthRepository } from "./repository.js";

export class AuthService {
  constructor(private readonly repository = new AuthRepository()) {}

  async login(_dto: LoginRequestDto): Promise<LoginResponseDto> {
    this.repository.findUserForLogin();
  }

  async requestPasswordReset(_dto: ForgotPasswordRequestDto): Promise<void> {
    return notImplemented("AuthService.requestPasswordReset");
  }
}
