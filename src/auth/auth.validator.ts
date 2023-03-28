import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

@ValidatorConstraint({ name: 'isSha256Encrypted', async: false })
class IsSha256EncryptedConstraint implements ValidatorConstraintInterface {
  validate(stringToTest: string) {
    const regexExp = /^[a-f0-9]{64}$/gi;
    return regexExp.test(stringToTest);
  }

  defaultMessage() {
    return 'sha256으로 인코딩된 문자열이 아닙니다.';
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
