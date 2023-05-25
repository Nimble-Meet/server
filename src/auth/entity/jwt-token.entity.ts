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
  id?: number;

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
  user?: User;

  @Column({ nullable: false, unique: true })
  @IsNumber()
  userId: number;

  private constructor(
    accessToken: string,
    refreshToken: string,
    expiresAt: Date,
    userId: number,
    id?: number,
  ) {
    this.id = id;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresAt = expiresAt;
    this.userId = userId;
  }

  static create({
    id,
    accessToken,
    refreshToken,
    expiresAt,
    userId,
  }: {
    id?: number;
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    userId: number;
  }): JwtToken {
    return new JwtToken(accessToken, refreshToken, expiresAt, userId, id);
  }

  clone(): JwtToken {
    return new JwtToken(
      this.accessToken,
      this.refreshToken,
      this.expiresAt,
      this.userId,
      this.id,
    );
  }

  equalsAccessToken(accessToken: string): boolean {
    return this.accessToken === accessToken;
  }
}
