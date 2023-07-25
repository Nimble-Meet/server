import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsMeetName } from '../meet.validator';
import { MeetMember } from './meet-member.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Meet {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @IsMeetName()
  meetName: string;

  @ManyToOne(() => User, {
    nullable: false,
  })
  @JoinColumn()
  host: User;

  @OneToMany(() => MeetMember, (meetMember) => meetMember.member)
  members?: User[];

  private constructor(meetName: string, host: User) {
    this.meetName = meetName;
    this.host = host;
  }

  static create({ meetName, host }: { meetName: string; host: User }) {
    return new Meet(meetName, host);
  }
}
