import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { IUserService } from './user.service.interface';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SimpleUserResponseDto } from './dto/response/simple-user-response.dto';
import { NeedLogin } from '../auth/decorators/need-login.decorator';
import { GetByEmailRequestDto } from './dto/request/get-by-email-request.dto';
import { UserErrorMessage } from './user.error-message';
import { GetByEmailBadrequestResponseDto } from './dto/error/get-by-email-badrequest-response.dto';
import { GetByEmailNotfoundResponseDto } from './dto/error/get-by-email-notfound-response.dto';

@ApiTags('user')
@Controller('api/user')
export class UserController {
  constructor(
    @Inject(IUserService)
    private readonly userService: IUserService,
  ) {}

  @Get()
  @ApiOperation({ description: '이메일로 사용자 조회' })
  @ApiOkResponse({
    description: '사용자 조회 성공',
    type: SimpleUserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'email 형식이 잘못됨',
    type: GetByEmailBadrequestResponseDto,
  })
  @ApiNotFoundResponse({
    description: '이메일에 해당하는 사용자가 존재하지 않음',
    type: GetByEmailNotfoundResponseDto,
  })
  @NeedLogin()
  async getUserByEmail(
    @Query() getUserByEmailRequestDto: GetByEmailRequestDto,
  ) {
    const user = await this.userService.getUserByEmail(
      getUserByEmailRequestDto.email,
    );
    if (!user) {
      throw new NotFoundException(UserErrorMessage.USER_NOT_FOUND_BY_EMAIL);
    }
    return SimpleUserResponseDto.fromUser(user);
  }
}
