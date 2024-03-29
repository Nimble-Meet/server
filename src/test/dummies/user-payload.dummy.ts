import { EMAIL, NICKNAME, USER_ID } from './user.dummy';
import { OauthProvider } from '../../common/enums/oauth-provider.enum';
import { UserPayloadDto } from '../../auth/dto/user-payload.dto';

export const createUserPayloadDto = ({
  id = USER_ID,
  email = EMAIL,
  nickname = NICKNAME,
  providerType = OauthProvider.LOCAL,
}: Partial<UserPayloadDto>): UserPayloadDto =>
  UserPayloadDto.create({ id, email, nickname, providerType });
