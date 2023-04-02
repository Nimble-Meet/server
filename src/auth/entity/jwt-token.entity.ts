import { IsNotEmpty, IsNumber } from 'class-validator';
import { User } from 'src/user/entities/user.entity';
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

  @Column({ nullable: false })
  @IsNumber()
  userId: number;
}
