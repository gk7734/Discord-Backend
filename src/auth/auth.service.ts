import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from 'prisma/prisma-client';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, username, nickname, password, promo, birthday } =
      createUserDto;
    const isUserExist = await this.prisma.user.findUnique({
      where: { email },
      select: { email: true },
    });

    if (email === isUserExist.email) {
      throw new UnauthorizedException('중복 사용자 제한');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    return this.prisma.user.create({
      data: {
        email,
        username,
        nickname,
        password: hashedPassword,
        birth: birthday,
        promo,
      },
    });
  }

  async updateUser(updateUserDto: UpdateUserDto): Promise<User> {
    const { email, username, nickname, password, promo, birthday } =
      updateUserDto;
    const isEmail = await this.prisma.user.findUnique({ where: { email } });

    if (!isEmail) {
      throw new UnauthorizedException('사용자가 존재하지 않습니다.');
    }

    if (password) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      return this.prisma.user.update({
        where: { email },
        data: {
          email,
          username,
          nickname,
          password: hashedPassword,
          birth: birthday,
          promo,
        },
      });
    } else {
      return this.prisma.user.update({
        where: { email },
        data: {
          email,
          username,
          nickname,
          birth: birthday,
          promo,
        },
      });
    }
  }
}
