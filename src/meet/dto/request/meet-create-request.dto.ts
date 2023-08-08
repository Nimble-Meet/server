import { IsMeetDescription, IsMeetName } from '../../meet.validator';
import { ApiProperty } from '@nestjs/swagger';

export class MeetCreateRequestDto {
  @IsMeetName()
  @ApiProperty({
    example: 'meet name',
    description: '미팅 이름',
  })
  meetName: string;

  @IsMeetDescription()
  @ApiProperty({
    example: 'meet description',
    description: '미팅 설명',
  })
  description: string;

  protected constructor(meetName: string, description: string) {
    this.meetName = meetName;
    this.description = description;
  }

  static create({
    meetName,
    description,
  }: {
    meetName: string;
    description: string;
  }): MeetCreateRequestDto {
    return new MeetCreateRequestDto(meetName, description);
  }
}
