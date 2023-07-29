import { Meet } from './entities/meet.entity';
import { MeetMember } from './entities/meet-member.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { MeetController } from './meet.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Meet, MeetMember])],
  providers: [],
  controllers: [MeetController],
})
export class MeetModule {}
