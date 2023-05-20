import * as crypto from 'crypto';

export const encryptPasswordInSha256 = (password: string): string =>
  crypto.createHash('sha256').update(password).digest('hex');
