import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { OauthProvider } from '../../common/enums/oauth-provider.enum';

export class OauthPayloadDto {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly nickname: string;

  @IsString()
  @IsNotEmpty()
  readonly providerType: OauthProvider;

  @IsString()
  @IsNotEmpty()
  readonly providerId: string;

  private constructor(
    email: string,
    nickname: string,
    providerType: OauthProvider,
    providerId: string,
  ) {
    this.email = email;
    this.nickname = nickname;
    this.providerType = providerType;
    this.providerId = providerId;
  }

  static create(createInfo: {
    email: string;
    nickname: string;
    providerType: OauthProvider;
    providerId: string;
  }) {
    return new OauthPayloadDto(
      createInfo.email,
      createInfo.nickname,
      createInfo.providerType,
      createInfo.providerId,
    );
  }
}
