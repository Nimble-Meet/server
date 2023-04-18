import { IsNotEmpty, IsNumber } from 'class-validator';
import { User } from '../../user/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class JwtToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  @IsNotEmpty()
  accessToken: string;

  @Column({ unique: true, nullable: false })
  @IsNotEmpty()
  refreshToken: string;

  @Column({ type: 'datetime', nullable: false })
  @IsNotEmpty()
  expiresAt: Date;

  @OneToOne(() => User, (user) => user.jwtToken, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  user: User;

  @Column({ nullable: false, unique: true })
  @IsNumber()
  userId: number;

  private constructor(partial: Partial<JwtToken>) {
    Object.assign(this, partial);
  }

  static create(createJwtTokenInfo: {
    id?: number;
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    userId: number;
  }): JwtToken {
    return new JwtToken(createJwtTokenInfo);
  }

  static clone(jwtToken: JwtToken): JwtToken {
    return new JwtToken(jwtToken);
  }

  equalsAccessToken(accessToken: string): boolean {
    return this.accessToken === accessToken;
  }
}
