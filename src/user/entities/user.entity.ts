import { IsString } from 'class-validator';
import { JwtToken } from 'src/auth/entity/jwt-token.entity';
import { OauthProvider } from 'src/common/enums/oauth-provider.enum';
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
  static from = (partial: Partial<User>) => new User(partial);
}
