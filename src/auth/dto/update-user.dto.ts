import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  nickname: string;

  @IsString()
  @IsOptional()
  username: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsString()
  @IsOptional()
  birthday: string;

  @IsBoolean()
  @IsOptional()
  promo: boolean;
}
