import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CaptchaService {
  async verify(token: string): Promise<boolean> {
    const res = await axios.postForm('https://api.hcaptcha.com/siteverify', {
      secret: process.env.HCAPTCHA_SECRET_KEY,
      response: token,
    });

    return res.data.success;
  }
}
