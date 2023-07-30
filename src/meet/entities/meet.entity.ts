import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsMeetDescription, IsMeetName } from '../meet.validator';
import { MeetToMember } from './meet-to-member.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Meet {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @Column()
  @IsMeetName()
  meetName: string;

  @Column({ nullable: true })
  @IsMeetDescription()
  description?: string;

  @ManyToOne(() => User, {
    nullable: false,
  })
  @JoinColumn()
  host: User;

  @OneToMany(() => MeetToMember, (meetToMember) => meetToMember.meet)
  meetToMembers!: MeetToMember[];

  private constructor(meetName: string, host: User, description?: string) {
    this.meetName = meetName;
    this.host = host;
    this.description = description;
  }

  static create({
    meetName,
    host,
    description,
  }: {
    meetName: string;
    host: User;
    description?: string;
  }) {
    return new Meet(meetName, host, description);
  }
}
