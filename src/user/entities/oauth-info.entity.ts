import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';

import { OauthProvider } from 'src/common/enums/oauth-provider.enum';
import { IsNotEmpty } from 'class-validator';
import { User } from './user.entity';

@Entity()
export class OauthInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: OauthProvider })
  @IsNotEmpty()
  provider: string;

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
