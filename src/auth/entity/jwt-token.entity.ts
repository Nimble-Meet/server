import { IsNotEmpty, IsNumber } from 'class-validator';
import { User } from '../../user/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  RelationId,
} from 'typeorm';

@Entity()
export class JwtToken {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ unique: true })
  @IsNotEmpty()
  accessToken: string;

  @Column({ unique: true })
  @IsNotEmpty()
  refreshToken: string;

  @Column({ type: 'datetime' })
  @IsNotEmpty()
  expiresAt: Date;

  @OneToOne(() => User, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  user: User;

  @Column({ nullable: false, type: 'bigint' })
  @IsNumber()
  @RelationId((jwtToken: JwtToken) => jwtToken.user)
  userId!: string;

  private constructor(
    accessToken: string,
    refreshToken: string,
    expiresAt: Date,
    user: User,
    id?: string,
  ) {
    if (id) {
      this.id = id;
    }
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresAt = expiresAt;
    this.user = user;
    this.userId = user?.id;
  }

  static create({
    id,
    accessToken,
    refreshToken,
    expiresAt,
    user,
  }: {
    id?: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    user: User;
  }): JwtToken {
    return new JwtToken(accessToken, refreshToken, expiresAt, user, id);
  }

  clone(): JwtToken {
    return new JwtToken(
      this.accessToken,
      this.refreshToken,
      this.expiresAt,
      this.user,
      this.id,
    );
  }

  equalsAccessToken(accessToken: string): boolean {
    return this.accessToken === accessToken;
  }
}
