import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { IsEmail, IsNotEmpty, Length, MaxLength } from 'class-validator';

import { OauthInfo } from './oauth-info.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ unique: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Column()
  @Length(8, 20)
  password: string;

  @Column({ unique: true })
  @IsNotEmpty()
  @MaxLength(15)
  nickname: string;

  @OneToOne(() => OauthInfo, (oauthInfo) => oauthInfo.user, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: 'oauthInfoId', referencedColumnName: 'id' })
  oauthInfo: OauthInfo;
}
