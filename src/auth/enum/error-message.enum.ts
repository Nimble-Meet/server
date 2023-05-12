export enum ErrorMessage {
  EMAIL_ALREADY_EXISTS = '이미 존재하는 이메일입니다.',
  NICKNAME_ALREADY_EXISTS = '이미 존재하는 닉네임입니다.',

  LOGIN_FAILED = '이메일 또는 비밀번호가 일치하지 않습니다.',

  REFRESH_TOKEN_DOES_NOT_EXIST = '리프레시 토큰이 존재하지 않습니다.',
  ACCESS_TOKEN_DOES_NOT_EXIST = '엑세스 토큰이 존재하지 않습니다.',
  INVALID_REFRESH_TOKEN = '유효하지 않은 리프레시 토큰입니다.',
  INCONSISTENT_ACCESS_TOKEN = '이전에 발급한 엑세스 토큰이 아닙니다.',
  EXPIRED_REFRESH_TOKEN = '리프레시 토큰이 만료되었습니다.',
}
