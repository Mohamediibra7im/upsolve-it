import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserDocument } from '../auth/schemas/user.schema';
import { CreateRoomDto, EndVoteDto, RoomProgressDto } from './dto/room.dto';
import { RoomsService } from './rooms.service';

/** Every route is rate limited by RateLimiterGuard, keyed `RoomsController.<method>`. */
@UseGuards(AuthGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly rooms: RoomsService) {}

  @Post()
  create(@Body() body: CreateRoomDto, @CurrentUser() user: UserDocument) {
    return this.rooms.create(body, user);
  }

  @Get(':code')
  get(@Param('code') code: string, @CurrentUser() user: UserDocument) {
    return this.rooms.get(code, user);
  }

  @Post(':code/join')
  @HttpCode(200)
  join(@Param('code') code: string, @CurrentUser() user: UserDocument) {
    return this.rooms.join(code, user);
  }

  @Post(':code/start')
  @HttpCode(200)
  start(@Param('code') code: string, @CurrentUser() user: UserDocument) {
    return this.rooms.start(code, user);
  }

  @Post(':code/progress')
  @HttpCode(200)
  progress(
    @Param('code') code: string,
    @Body() body: RoomProgressDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.rooms.progress(code, body, user);
  }

  @Post(':code/end-vote')
  @HttpCode(200)
  endVote(
    @Param('code') code: string,
    @Body() body: EndVoteDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.rooms.endVote(code, body.agree, user);
  }

  @Post(':code/leave')
  @HttpCode(200)
  leave(@Param('code') code: string, @CurrentUser() user: UserDocument) {
    return this.rooms.leave(code, user);
  }
}
