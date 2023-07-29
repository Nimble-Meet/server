import { Controller, Get, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { MeetCreateRequestDto } from './dto/request/meet-create-request.dto';
import { MeetInviteRequestDto } from './dto/request/meet-invite-request.dto';
import { MeetResponseDto } from './dto/response/meet-response.dto';
import { MeetNotFoundResponseDto } from './dto/error/meet-not-found-response.dto';

@ApiTags('meet')
@Controller('api/meet')
export class MeetController {
  constructor() {
    return;
  }

  @Get()
  @ApiOperation({ description: '생성하거나 참여한 미팅 목록 조회' })
  @ApiOkResponse({
    description: '미팅 목록 조회 성공',
    type: MeetResponseDto,
    isArray: true,
  })
  async getMeets() {
    return;
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
  async createMeet() {
    return;
  }

  @Get(':meetId')
  @ApiOperation({ description: '미팅 상세 정보 조회' })
  @ApiOkResponse({
    description: '미팅 상세 정보 조회 성공',
    type: MeetResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'id에 해당하는 미팅을 찾을 수 없음',
    type: MeetNotFoundResponseDto,
  })
  async getMeet() {
    return;
  }

  @Post(':meetId/invite')
  @ApiOperation({ description: '미팅 초대' })
  @ApiBody({
    description: '초대할 사용자의 이메일',
    type: MeetInviteRequestDto,
  })
  @ApiCreatedResponse({
    description: '미팅 초대 성공',
    type: MeetResponseDto,
  })
  async invite() {
    return;
  }
}
