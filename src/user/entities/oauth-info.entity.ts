import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';

import { IsNotEmpty } from 'class-validator';
import { User } from './user.entity';

@Entity()
export class OauthInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  providerId: string;

  @Column()
  accessToken: string;

  @Column()
  refreshToken: string;

  @Column()
  expiresIn: number;

  @OneToOne(() => User, (user) => user.oauthInfo, {
    onDelete: 'CASCADE',
  })
  user: User;
}
