import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Meet } from './meet.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class MeetToMember {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @CreateDateColumn()
  createdAt?: Date;

  @ManyToOne(() => Meet, (meet) => meet.meetToMembers)
  @JoinColumn({ name: 'meet_id' })
  meet!: Meet;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'member_id' })
  member!: User;

  private constructor(meet: Meet, member: User, id?: string) {
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
    id?: string;
    meet: Meet;
    member: User;
  }): MeetToMember {
    return new MeetToMember(meet, member, id);
  }
}
