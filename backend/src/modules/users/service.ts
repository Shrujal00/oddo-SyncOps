import { notImplemented } from "../../common/exceptions/not-implemented.js";
import type { CreateUserDto, UpdateUserDto, UserResponseDto } from "./dto.js";
import { UsersRepository } from "./repository.js";

export class UsersService {
  constructor(private readonly repository = new UsersRepository()) {}

  async list(): Promise<UserResponseDto[]> {
    this.repository.listUsers();
  }

  async create(_dto: CreateUserDto): Promise<UserResponseDto> {
    return notImplemented("UsersService.create");
  }

  async update(_id: string, _dto: UpdateUserDto): Promise<UserResponseDto> {
    return notImplemented("UsersService.update");
  }
}
