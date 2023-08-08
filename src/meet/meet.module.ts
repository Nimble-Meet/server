import { Meet } from './entities/meet.entity';
import { MeetToMember } from './entities/meet-to-member.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { MeetController } from './meet.controller';
import { IMeetService } from './meet.service.interface';
import { MeetServiceImpl } from './meet.service';
import { IMeetRepository } from './repository/meet.repository.interface';
import { MeetRepositoryImpl } from './repository/meet.repository';
import { UserModule } from '../user/user.module';
import { MeetToMemberRepositoryImpl } from './repository/meet-to-member.repository';
import { IMeetToMemberRepository } from './repository/meet-to-member.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([Meet, MeetToMember]), UserModule],
  providers: [
    {
      provide: IMeetService,
      useClass: MeetServiceImpl,
    },
    {
      provide: IMeetRepository,
      useClass: MeetRepositoryImpl,
    },
    {
      provide: IMeetToMemberRepository,
      useClass: MeetToMemberRepositoryImpl,
    },
  ],
  controllers: [MeetController],
})
export class MeetModule {}
