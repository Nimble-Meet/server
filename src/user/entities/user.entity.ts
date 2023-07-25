import { IsString } from 'class-validator';
import { OauthProvider } from '../../common/enums/oauth-provider.enum';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import {
  IsUserEmail,
  IsUserNickname,
  IsBcryptEncrypted,
} from '../user.validator';
import { MeetMember } from '../../meet/entities/meet-member.entity';
import { Meet } from '../../meet/entities/meet.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @Column({ unique: true })
  @IsUserEmail()
  email: string;

  @Column({ nullable: true })
  @IsBcryptEncrypted()
  password?: string;

  @Column()
  @IsUserNickname()
  nickname: string;

  @Column({ type: 'enum', enum: OauthProvider, default: OauthProvider.LOCAL })
  providerType: OauthProvider;

  @Column({ nullable: true })
  @IsString()
  providerId?: string;

  @OneToMany(() => MeetMember, (meetMember) => meetMember.meet)
  joinedMeets?: Meet[];

  private constructor(
    email: string,
    nickname: string,
    providerType: OauthProvider,
    id?: number,
    password?: string,
    providerId?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    if (id) {
      this.id = id;
    }
    this.email = email;
    this.password = password;
    this.nickname = nickname;
    this.providerType = providerType;
    this.providerId = providerId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
  static create({
    id,
    email,
    password,
    nickname,
    providerType,
    providerId,
  }: {
    id?: number;
    email: string;
    password?: string;
    nickname: string;
    providerType: OauthProvider;
    providerId?: string;
  }): User {
    return new User(email, nickname, providerType, id, password, providerId);
  }

  clone(): User {
    return new User(
      this.email,
      this.nickname,
      this.providerType,
      this.id,
      this.password,
      this.providerId,
      this.createdAt,
      this.updatedAt,
    );
  }
}
