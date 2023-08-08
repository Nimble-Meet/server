import {
  AfterLoad,
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
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

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
  @JoinColumn({ name: 'host_id' })
  host: User;

  @OneToMany(() => MeetToMember, (meetToMember) => meetToMember.meet)
  meetToMembers?: MeetToMember[];

  @AfterLoad()
  async nullChecks() {
    if (!this.meetToMembers) {
      this.meetToMembers = [];
    }
  }

  private constructor(
    meetName: string,
    host: User,
    meetToMembers?: MeetToMember[],
    description?: string,
    id?: string,
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
    id?: string;
    meetName: string;
    host: User;
    meetToMembers?: MeetToMember[];
    description?: string;
  }) {
    return new Meet(meetName, host, meetToMembers, description, id);
  }

  isHost(userId: string): boolean {
    return this.host.id === userId;
  }

  isInvited(userId: string): boolean {
    return !!this.meetToMembers?.some(
      (meetToMember) => meetToMember.member.id === userId,
    );
  }

  findMember(meetToMemberId: string): MeetToMember | null {
    return (
      this.meetToMembers?.find(
        (meetToMember) => meetToMember.id === meetToMemberId,
      ) || null
    );
  }
}
