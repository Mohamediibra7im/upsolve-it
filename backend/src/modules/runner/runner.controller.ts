import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { LANGUAGES, RunnerService, type Language } from './runner.service';

export class RunCodeDto {
  @IsIn(Object.keys(LANGUAGES))
  language!: Language;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64_000, { message: 'The code is too long to run here.' })
  code!: string;

  /** One run per input: the sample tests, or one input of the user's own. */
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(8)
  @IsString({ each: true })
  @MaxLength(60_000, {
    each: true,
    message: 'An input is too long to run here.',
  })
  inputs!: string[];
}

@Controller('run')
export class RunnerController {
  constructor(private readonly runner: RunnerService) {}

  /** Runs the caller's code on each input and returns what it printed. Rate limited per user. */
  @UseGuards(AuthGuard)
  @Post()
  async run(@Body() body: RunCodeDto) {
    return {
      results: await this.runner.run(body.language, body.code, body.inputs),
    };
  }
}
