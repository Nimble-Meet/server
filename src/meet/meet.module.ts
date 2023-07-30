import { Meet } from './entities/meet.entity';
import { MeetToMember } from './entities/meet-to-member.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { MeetController } from './meet.controller';
import { IMeetService } from './meet.service.interface';
import { MeetServiceImpl } from './meet.service';
import { IMeetRepository } from './repository/meet.repository.interface';
import { MeetRepositoryImpl } from './repository/meet.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Meet, MeetToMember])],
  providers: [
    {
      provide: IMeetService,
      useClass: MeetServiceImpl,
    },
    {
      provide: IMeetRepository,
      useClass: MeetRepositoryImpl,
    },
  ],
  controllers: [MeetController],
})
export class MeetModule {}
