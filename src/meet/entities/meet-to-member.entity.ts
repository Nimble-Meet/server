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
  meet!: Promise<Meet>;

  @ManyToOne(() => User)
  member!: Promise<User>;

  private constructor(meet: Promise<Meet>, member: Promise<User>) {
    this.meet = meet;
    this.member = member;
  }

  static create({
    meet,
    member,
  }: {
    meet: Promise<Meet>;
    member: Promise<User>;
  }): MeetToMember {
    return new MeetToMember(meet, member);
  }
}
