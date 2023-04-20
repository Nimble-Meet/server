import { IsString } from 'class-validator';
import { JwtToken } from '../../auth/entity/jwt-token.entity';
import { OauthProvider } from '../../common/enums/oauth-provider.enum';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import {
  IsUserEmail,
  IsUserNickname,
  IsBcryptEncrypted,
} from '../user.validator';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ unique: true })
  @IsUserEmail()
  email: string;

  @Column()
  @IsBcryptEncrypted()
  password: string;

  @Column({ unique: true })
  @IsUserNickname()
  nickname: string;

  @Column({ type: 'enum', enum: OauthProvider, default: OauthProvider.LOCAL })
  providerType: string;

  @Column()
  @IsString()
  providerId: string;

  @OneToOne(() => JwtToken, (jwtToken) => jwtToken.user)
  @JoinColumn()
  jwtToken: JwtToken;

  private constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
  static create(createUserInfo: {
    id?: number;
    email: string;
    password: string;
    nickname: string;
    providerType?: string;
    providerId?: string;
  }): User {
    return new User(createUserInfo);
  }
}
