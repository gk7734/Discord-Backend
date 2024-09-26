import {
  Body,
  Controller,
  Delete,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserCredentialDto } from './dto/user-credential.dto';
import { JwtAuthGuard } from './jwt/jwt.guard';
import { GetUser } from '../decorator/get-user.decorator';
import { User } from 'prisma/prisma-client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async loginUser(@Body() userCredentialDto: UserCredentialDto) {
    const accessToken = await this.authService.loginUser(userCredentialDto);
    if (accessToken) {
      return { accessToken: accessToken.accessToken, message: '로그인 성공!' };
    }
  }

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @Patch('update')
  @UseGuards(JwtAuthGuard)
  updateUser(@Body() updateUserDto: UpdateUserDto) {
    return this.authService.updateUser(updateUserDto);
  }

  @Delete('resign')
  @UseGuards(JwtAuthGuard)
  deleteUser(@GetUser() user: User): Promise<void> {
    return this.authService.deleteUser(user.email);
  }
}
