import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
  ValidationOptions,
  IsEmail,
  IsNotEmpty,
  Length,
} from 'class-validator';

import { applyDecorators } from '@nestjs/common';
import { UserErrorMessage } from './user.error-message';

@ValidatorConstraint({ name: 'isBcryptEncrypted', async: false })
export class IsBcryptEncryptedConstraint
  implements ValidatorConstraintInterface
{
  validate(stringToTest: string) {
    const regexExp = /^[a-zA-Z0-9\$\.\/]{60}$/gi;
    return regexExp.test(stringToTest);
  }

  defaultMessage() {
    return UserErrorMessage.NOT_BCRYPT_ENCRYPTED;
  }
}

export function IsBcryptEncrypted(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isBcryptEncrypted',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsBcryptEncryptedConstraint,
    });
  };
}

export function IsUserEmail() {
  return applyDecorators(IsEmail(), IsNotEmpty());
}

export function IsUserNickname() {
  return applyDecorators(IsNotEmpty(), Length(1, 15));
}
