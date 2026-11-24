import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserDocument } from '../auth/schemas/user.schema';
import { RemindersService } from './reminders.service';

class RedeemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  token!: string;
}

@Controller('reminders')
export class RemindersController {
  constructor(private readonly reminders: RemindersService) {}

  @UseGuards(AuthGuard)
  @Get()
  status(@CurrentUser() user: UserDocument) {
    return this.reminders.status(user._id.toString());
  }

  @UseGuards(AuthGuard)
  @Put()
  subscribe(@CurrentUser() user: UserDocument) {
    return this.reminders.subscribe(user);
  }

  @UseGuards(AuthGuard)
  @Delete()
  unsubscribe(@CurrentUser() user: UserDocument) {
    return this.reminders.unsubscribe(user._id.toString());
  }

  /** Confirm or unsubscribe from an emailed link; the token is the proof. */
  @Post('redeem')
  redeem(@Body() body: RedeemDto) {
    return this.reminders.redeem(body.token);
  }
}
