import { IsDate, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsMeetDescription, IsMeetName } from '../../meet.validator';
import { Meet } from '../../entities/meet.entity';
import { SimpleUserResponseDto } from '../../../user/dto/response/simple-user-response.dto';

export class MeetResponseDto {
  @IsNumber()
  @ApiProperty({
    example: 1,
    description: '미팅의 unique id',
  })
  private readonly id: number;

  @IsMeetName()
  @ApiProperty({
    example: 'meet name',
    description: '미팅 이름',
  })
  private readonly meetName: string;

  @IsMeetDescription()
  @ApiProperty({
    example: 'meet description',
    description: '미팅 설명',
  })
  private readonly description?: string;

  @IsDate()
  @ApiProperty({
    example: new Date(),
    description: '미팅 생성 시간',
  })
  private readonly createdAt: Date;

  @ApiProperty({
    example: SimpleUserResponseDto.create({
      email: 'host@email.com',
      nickname: 'host',
    }),
    description: '미팅을 생성한 사용자 정보',
  })
  private readonly host: SimpleUserResponseDto;

  @ApiProperty({
    example: [
      SimpleUserResponseDto.create({
        email: 'member1@email.com',
        nickname: 'member1',
      }),
      SimpleUserResponseDto.create({
        email: 'member2@email.com',
        nickname: 'member2',
      }),
    ],
    description: '미팅에 참여한 사용자들의 정보',
  })
  private readonly members: SimpleUserResponseDto[];

  protected constructor(
    id: number,
    meetName: string,
    createdAt: Date,
    host: SimpleUserResponseDto,
    members: SimpleUserResponseDto[],
    description?: string,
  ) {
    this.id = id;
    this.meetName = meetName;
    this.createdAt = createdAt;
    this.host = host;
    this.members = members;
    this.description = description;
  }

  public static fromMeet(meet: Meet) {
    return new MeetResponseDto(
      meet.id,
      meet.meetName,
      meet.createdAt,
      SimpleUserResponseDto.fromUser(meet.host),
      meet.members.map((member) => SimpleUserResponseDto.fromUser(member)),
      meet.description,
    );
  }
}
