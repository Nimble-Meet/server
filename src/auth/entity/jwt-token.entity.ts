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
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, nullable: false })
  @IsNotEmpty()
  accessToken: string;

  @Column({ unique: true, nullable: false })
  @IsNotEmpty()
  refreshToken: string;

  @Column({ type: 'datetime', nullable: false })
  @IsNotEmpty()
  expiresAt: Date;

  @OneToOne(() => User, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  user!: User;

  @Column({ nullable: false })
  @IsNumber()
  @RelationId((jwtToken: JwtToken) => jwtToken.user)
  userId!: number;

  private constructor(
    accessToken: string,
    refreshToken: string,
    expiresAt: Date,
    user: User,
    id?: number,
  ) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresAt = expiresAt;
    this.user = user;
    if (id) {
      this.id = id;
    }
  }

  static create({
    id,
    accessToken,
    refreshToken,
    expiresAt,
    user,
  }: {
    id?: number;
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
