import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Meet } from './meet.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class MeetMember {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  createdAt?: Date;

  @ManyToOne(() => Meet, (meet) => meet.members)
  meet!: Meet;

  @ManyToOne(() => User, (user) => user.joinedMeets)
  member!: User;
}
