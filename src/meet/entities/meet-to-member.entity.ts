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
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @CreateDateColumn()
  createdAt?: Date;

  @ManyToOne(() => Meet, (meet) => meet.meetToMembers)
  meet!: Meet;

  @ManyToOne(() => User)
  member!: User;

  private constructor(meet: Meet, member: User, id?: number) {
    this.meet = meet;
    this.member = member;
    if (id) {
      this.id = id;
    }
  }

  static create({
    id,
    meet,
    member,
  }: {
    id?: number;
    meet: Meet;
    member: User;
  }): MeetToMember {
    return new MeetToMember(meet, member, id);
  }
}
