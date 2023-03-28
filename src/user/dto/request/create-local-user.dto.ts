import { IsNotEmpty, IsString } from 'class-validator';

import { IsUserEmail, IsUserNickname } from 'src/user/user.validator';
import { IsBcryptEncrypted } from 'src/user/user.validator';

export class CreateLocalUserDto {
  @IsString()
  @IsUserEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsBcryptEncrypted()
  password: string;

  @IsString()
  @IsUserNickname()
  nickname: string;
}
