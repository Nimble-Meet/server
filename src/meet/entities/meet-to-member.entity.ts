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

  @ManyToOne(() => User)
  member!: User;

  private constructor(meet: Meet, member: User) {
    this.meet = meet;
    this.member = member;
  }

  static create({ meet, member }: { meet: Meet; member: User }): MeetToMember {
    return new MeetToMember(meet, member);
  }
}
