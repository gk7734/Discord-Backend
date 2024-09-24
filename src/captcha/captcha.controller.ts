import { Body, Controller, Post } from '@nestjs/common';
import { CaptchaService } from './captcha.service';

@Controller('captcha')
export class CaptchaController {
  constructor(private readonly captchaService: CaptchaService) {}

  @Post('verify')
  captchaVerify(@Body('token') token: string): Promise<boolean> {
    return this.captchaService.verify(token);
  }
}
