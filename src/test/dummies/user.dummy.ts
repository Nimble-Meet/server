import { EncryptedPassword } from 'src/auth/EncryptedPassword';
import { User } from '../../user/entities/user.entity';

export const USER_ID = 1;
export const EMAIL = 'test@example.com';
export const NICKNAME = 'testuser';
export const PASSWORD = 'test1234';
export const ENCRYPTED_PASSWORD = EncryptedPassword.encryptFrom(PASSWORD);

export const createUser = ({
  id = USER_ID,
  email = EMAIL,
  nickname = NICKNAME,
  password = ENCRYPTED_PASSWORD.getPassword(),
}) => User.create({ id, email, nickname, password });
