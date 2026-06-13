import { createHash, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { HttpError } from "../../common/exceptions/http-error.js";
import type {
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  ForgotPasswordRequestDto,
} from "./dto.js";
import { AuthRepository } from "./repository.js";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const { randomBytes } = await import("crypto");
  const salt = randomBytes(16).toString("hex");
  const key = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  const key = (await scryptAsync(password, salt, 64)) as Buffer;
  const storedBuf = Buffer.from(hash, "hex");
  return timingSafeEqual(key, storedBuf);
}

function signToken(payload: { sub: string; roleId: string; roleName: string }): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as any);
}

export class AuthService {
  constructor(private readonly repository = new AuthRepository()) {}

  async login(dto: LoginRequestDto): Promise<LoginResponseDto> {
    const user = await this.repository.findUserByEmail(dto.email);
    if (!user) throw new HttpError(401, "Invalid email or password");

    const valid = await verifyPassword(dto.password, user.passwordHash);
    if (!valid) throw new HttpError(401, "Invalid email or password");

    const token = signToken({ sub: user.id, roleId: user.roleId, roleName: user.role.name });

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
      },
    };
  }

  async register(dto: RegisterRequestDto): Promise<LoginResponseDto> {
    const existing = await this.repository.findUserByEmail(dto.email);
    if (existing) throw new HttpError(409, "Email already in use");

    const roleName = dto.roleName ?? "SALES_USER";
    const role = await this.repository.findRoleByName(roleName);
    if (!role) throw new HttpError(400, `Role '${roleName}' not found`);

    const passwordHash = await hashPassword(dto.password);
    const user = await this.repository.createUser({
      email: dto.email.toLowerCase(),
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      roleId: role.id,
    });

    const token = signToken({ sub: user.id, roleId: user.roleId, roleName: user.role.name });

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
      },
    };
  }

  async requestPasswordReset(_dto: ForgotPasswordRequestDto): Promise<void> {
    // TODO: email integration
  }
}
