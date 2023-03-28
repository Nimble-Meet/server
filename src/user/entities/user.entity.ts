import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { OauthProvider } from 'src/common/enums/oauth-provider.enum';

import { OauthInfo } from './oauth-info.entity';
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
  provider: string;

  @OneToOne(() => OauthInfo, (oauthInfo) => oauthInfo.user, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: 'oauthInfoId', referencedColumnName: 'id' })
  oauthInfo: OauthInfo;
}
