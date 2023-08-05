import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { MeetCreateRequestDto } from './dto/request/meet-create-request.dto';
import { MeetInviteRequestDto } from './dto/request/meet-invite-request.dto';
import { MeetResponseDto } from './dto/response/meet-response.dto';
import { MeetNotFoundResponseDto } from './dto/error/meet-not-found-response.dto';
import { RequestUser } from '../common/decorators/req-user.decorator';
import { UserPayloadDto } from '../auth/dto/user-payload.dto';
import { IMeetService } from './meet.service.interface';
import { NeedLogin } from '../auth/decorators/need-login.decorator';
import { MeetIdParamDto } from './dto/request/meet-id-param.dto';
import { MeetMemberIdParamDto } from './dto/request/meet-member-id-param.dto';
import { MemberResponseDto } from './dto/response/member-response.dto';

@ApiTags('meet')
@Controller('api/meet')
export class MeetController {
  constructor(
    @Inject(IMeetService)
    private readonly meetService: IMeetService,
  ) {}

  @Get()
  @ApiOperation({ description: '생성하거나 참여한 미팅 목록 조회' })
  @ApiOkResponse({
    description: '미팅 목록 조회 성공',
    type: MeetResponseDto,
    isArray: true,
  })
  @NeedLogin()
  async getMeets(
    @RequestUser() userPayload: UserPayloadDto,
  ): Promise<MeetResponseDto[]> {
    const meets = await this.meetService.getHostedOrInvitedMeets(
      userPayload.id,
    );
    return await Promise.all(
      meets.map((meet) => MeetResponseDto.fromMeet(meet)),
    );
  }

  @Post()
  @ApiOperation({ description: '미팅 생성' })
  @ApiBody({
    description: '미팅 이름, 설명',
    type: MeetCreateRequestDto,
  })
  @ApiCreatedResponse({
    description: '미팅 생성 성공',
    type: MeetResponseDto,
  })
  @NeedLogin()
  async createMeet(
    @RequestUser() userPayload: UserPayloadDto,
    @Body() meetCreateRequestDto: MeetCreateRequestDto,
  ): Promise<MeetResponseDto> {
    const meet = await this.meetService.createMeet(
      userPayload.id,
      meetCreateRequestDto,
    );
    return MeetResponseDto.fromMeet(meet);
  }

  @Get(':meetId')
  @ApiOperation({ description: '미팅 상세 정보 조회' })
  @ApiParam({
    description: '조회할 미팅의 id',
    name: 'meetId',
    type: Number,
  })
  @ApiOkResponse({
    description: '미팅 상세 정보 조회 성공',
    type: MeetResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'id에 해당하는 미팅을 찾을 수 없음',
    type: MeetNotFoundResponseDto,
  })
  @NeedLogin()
  async getMeet(
    @RequestUser() userPayload: UserPayloadDto,
    @Param() getMeetRequestDto: MeetIdParamDto,
  ): Promise<MeetResponseDto> {
    const meet = await this.meetService.getMeet(
      userPayload.id,
      getMeetRequestDto,
    );
    return MeetResponseDto.fromMeet(meet);
  }

  @Post(':meetId/member')
  @ApiParam({
    description: '초대할 미팅의 id',
    name: 'meetId',
    type: Number,
  })
  @ApiOperation({ description: '미팅 초대' })
  @ApiBody({
    description: '초대할 사용자의 이메일',
    type: MeetInviteRequestDto,
  })
  @ApiCreatedResponse({
    description: '미팅 초대 성공',
    type: MemberResponseDto,
  })
  @NeedLogin()
  async invite(
    @RequestUser() userPayload: UserPayloadDto,
    @Param() meetIdParamDto: MeetIdParamDto,
    @Body() meetInviteRequestDto: MeetInviteRequestDto,
  ): Promise<MemberResponseDto> {
    const meetToMember = await this.meetService.invite(
      userPayload,
      meetIdParamDto,
      meetInviteRequestDto,
    );
    return MemberResponseDto.fromMeetToMember(meetToMember);
  }

  @Delete(':meetId/member/:memberId')
  @ApiParam({
    description: '강퇴할 멤버의 id',
    name: 'memberId',
    type: Number,
  })
  @ApiParam({
    description: '강퇴할 미팅의 id',
    name: 'meetId',
    type: Number,
  })
  @ApiOperation({ description: '미팅 강퇴' })
  @ApiOkResponse({
    description: '미팅 강퇴 성공',
    type: MeetResponseDto,
  })
  @NeedLogin()
  async kickOut(
    @RequestUser() userPayload: UserPayloadDto,
    @Param() meetMemberIdParamDto: MeetMemberIdParamDto,
  ): Promise<MemberResponseDto> {
    const meetToMember = await this.meetService.kickOut(
      userPayload,
      meetMemberIdParamDto,
    );
    return MemberResponseDto.fromMeetToMember(meetToMember);
  }
}
