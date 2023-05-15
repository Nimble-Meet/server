import { USER_ID } from './user.dummy';
import { JwtToken } from '../../auth/entity/jwt-token.entity';

export const TOKEN_ID = 1;

export const ACCESS_TOKEN = 'valid_access_token';
export const REFRESH_TOKEN = 'valid_refresh_token';

export const createJwtToken = ({
  id = TOKEN_ID,
  userId = USER_ID,
  accessToken = ACCESS_TOKEN,
  refreshToken = REFRESH_TOKEN,
  expiresAt = new Date(),
}: Partial<JwtToken>) =>
  JwtToken.create({ id, userId, accessToken, refreshToken, expiresAt });
