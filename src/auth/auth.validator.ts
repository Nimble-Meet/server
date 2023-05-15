import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { AuthErrorMessage } from './auth.error-message';

@ValidatorConstraint({ name: 'isSha256Encrypted', async: false })
export class IsSha256EncryptedConstraint
  implements ValidatorConstraintInterface
{
  validate(stringToTest: string) {
    const regexExp = /^[a-f0-9]{64}$/gi;
    return regexExp.test(stringToTest);
  }

  defaultMessage() {
    return AuthErrorMessage.NOT_SHA256_ENCRYPTED;
  }
}

export function IsSha256Encrypted(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isSha256Encrypted',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsSha256EncryptedConstraint,
    });
  };
}
