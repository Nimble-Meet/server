import { EncryptedPassword } from 'src/auth/EncryptedPassword';
import { User } from '../../user/entities/user.entity';
import { OauthProvider } from '../../common/enums/oauth-provider.enum';

export const USER_ID = 1;
export const EMAIL = 'test@example.com';
export const NICKNAME = 'testuser';
export const PASSWORD = 'test1234';
export const ENCRYPTED_PASSWORD = EncryptedPassword.encryptFrom(PASSWORD);
export const PROVIDER_TYPE = OauthProvider.LOCAL;

export const createUser = ({
  id = USER_ID,
  email = EMAIL,
  nickname = NICKNAME,
  password = ENCRYPTED_PASSWORD.getPassword(),
  providerType = PROVIDER_TYPE,
}) => User.create({ id, email, nickname, password, providerType });
