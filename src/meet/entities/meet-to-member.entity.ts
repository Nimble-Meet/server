import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Meet } from './meet.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class MeetToMember {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  createdAt?: Date;

  @ManyToOne(() => Meet, (meet) => meet.meetToMembers)
  meet!: Meet;

  @ManyToOne(() => User, (user) => user.meetToMembers)
  member!: User;
}
