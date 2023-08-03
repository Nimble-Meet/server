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
  host: Promise<User>;

  @OneToMany(() => MeetToMember, (meetToMember) => meetToMember.meet)
  meetToMembers: Promise<MeetToMember[]>;

  private constructor(
    meetName: string,
    host: Promise<User>,
    meetToMembers: Promise<MeetToMember[]>,
    description?: string,
    id?: number,
  ) {
    this.meetName = meetName;
    this.host = host;
    this.description = description;
    this.meetToMembers = meetToMembers;
    if (id) {
      this.id = id;
    }
  }

  static create({
    id,
    meetName,
    host,
    meetToMembers,
    description,
  }: {
    id?: number;
    meetName: string;
    host: Promise<User>;
    meetToMembers?: Promise<MeetToMember[]>;
    description?: string;
  }) {
    return new Meet(
      meetName,
      host,
      meetToMembers || Promise.resolve([]),
      description,
      id,
    );
  }
}
