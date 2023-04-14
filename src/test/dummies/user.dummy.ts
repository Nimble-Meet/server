import { EncryptedPassword } from 'src/auth/EncryptedPassword';

export const USER_ID = 1;
export const EMAIL = 'test@example.com';
export const NICKNAME = 'testuser';
export const PASSWORD = 'test1234';
export const ENCRYPTED_PASSWORD = EncryptedPassword.encryptFrom(PASSWORD);
