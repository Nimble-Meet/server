import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MeetToMember } from '../../entities/meet-to-member.entity';
import { SimpleUserResponseDto } from '../../../user/dto/response/simple-user-response.dto';

export class MemberResponseDto extends SimpleUserResponseDto {
  @IsNumber()
  @ApiProperty({
    example: '1',
    description: '멤버의 unique id',
  })
  private readonly id: string;

  private constructor(id: string, email: string, nickname: string) {
    super(email, nickname);
    this.id = id;
  }

  static create(createInfo: { id: string; email: string; nickname: string }) {
    return new MemberResponseDto(
      createInfo.id,
      createInfo.email,
      createInfo.nickname,
    );
  }

  static fromMeetToMember(meetToMember: MeetToMember) {
    return MemberResponseDto.create({
      id: meetToMember.id,
      email: meetToMember.member.email,
      nickname: meetToMember.member.nickname,
    });
  }
}
