import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from 'prisma/prisma-client';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import { UserCredentialDto } from './dto/user-credential.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async loginUser(
    userCredentialDto: UserCredentialDto,
  ): Promise<{ accessToken: string }> {
    const { email, password } = userCredentialDto;
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { password: true },
    });

    if (!user) {
      throw new UnauthorizedException(
        '해당 이메일로 등록된 사용자를 찾을 수 없습니다.',
      );
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { email };
      const accessToken = this.jwtService.sign(payload);

      return { accessToken };
    } else {
      throw new UnauthorizedException('비밀번호가 다릅니다.');
    }
  }

  async createUser(createUserDto: CreateUserDto): Promise<{ message: string }> {
    const { email, username, nickname, password, promo, birthday } =
      createUserDto;
    const isUserExist = await this.prisma.user.findUnique({
      where: { email },
      select: { email: true },
    });

    if (isUserExist) {
      throw new UnauthorizedException('중복 사용자 제한');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    await this.prisma.user.create({
      data: {
        email,
        username,
        nickname,
        password: hashedPassword,
        birth: birthday,
        promo,
      },
    });

    return { message: '회원가입이 완료되었습니다.' };
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

  async deleteUser(email: string): Promise<void> {
    await this.prisma.user.delete({ where: { email } });
  }
}
