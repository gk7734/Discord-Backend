import { Body, Controller, Delete, Patch, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserCredentialDto } from './dto/user-credential.dto';

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
  updateUser(@Body() updateUserDto: UpdateUserDto) {
    return this.authService.updateUser(updateUserDto);
  }

  @Delete('delete')
  deleteUser(@Body('email') email: string): Promise<void> {
    return this.authService.deleteUser(email);
  }
}
