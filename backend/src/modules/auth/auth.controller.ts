import {
  Body,
  Controller,
  Get,
  GoneException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  ConnectAtcoderDto,
  ConnectCodeforcesDto,
  EmailCodeDto,
  EmailDto,
} from './dto/email.dto';
import {
  InitiateResetDto,
  VerifyResetEmailDto,
} from './dto/initiate-reset.dto';
import { VerifyResetProfileDto } from './dto/verify-reset-profile.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OptionalAuthGuard } from '../../common/guards/optional-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserDocument } from './schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.register(
      dto.username,
      dto.email,
      dto.password,
      req.ip ?? 'unknown',
    );
    this.setRefreshCookie(res, result.refreshToken);
    this.setAccessTokenCookie(res, result.token);
    return { user: result.user };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = req.ip ?? 'unknown';
    const result = await this.auth.login(
      dto.login ?? dto.codeforcesHandle ?? '',
      dto.password,
      ip,
    );
    this.setRefreshCookie(res, result.refreshToken);
    this.setAccessTokenCookie(res, result.token);
    return { user: result.user };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawRefreshToken: unknown = req.cookies?.refreshToken;
    const refreshToken =
      typeof rawRefreshToken === 'string' ? rawRefreshToken : undefined;
    if (!refreshToken) throw new UnauthorizedException('Missing refresh');
    const ip = req.ip ?? 'unknown';
    const userAgent = req.header('user-agent') ?? 'unknown';
    const result = await this.auth.refresh(refreshToken, ip, userAgent);
    this.setRefreshCookie(res, result.refreshToken);
    this.setAccessTokenCookie(res, result.token);
    return { user: result.user };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const isProduction = this.config.get<string>('NODE_ENV') === 'production';
    const rawRefreshToken: unknown = req.cookies?.refreshToken;
    const refreshToken =
      typeof rawRefreshToken === 'string' ? rawRefreshToken : undefined;
    if (refreshToken) await this.auth.logout(refreshToken);
    res.clearCookie('refreshToken', {
      path: '/',
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    });
    res.clearCookie('accessToken', {
      path: '/',
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    });
    return { ok: true };
  }

  @Get('health')
  health() {
    return { ok: true };
  }

  @Post('initiate-reset')
  async initiateReset(@Body() dto: InitiateResetDto) {
    return await this.auth.initiateReset(dto.handle, dto.via);
  }

  @Post('verify-reset-email')
  async verifyResetEmail(@Body() dto: VerifyResetEmailDto) {
    return await this.auth.verifyResetEmail(dto.verificationToken, dto.code);
  }

  @Post('verify-submission')
  verifySubmission() {
    throw new GoneException(
      'Restart password recovery and verify your Codeforces profile.',
    );
  }

  @Post('verify-reset-profile')
  async verifyResetProfile(@Body() dto: VerifyResetProfileDto) {
    return await this.auth.verifyResetProfile(dto.verificationToken);
  }

  @Post('reset-password')
  @UseGuards(OptionalAuthGuard)
  async resetPassword(
    @CurrentUser() user: UserDocument | null,
    @Body() dto: ResetPasswordDto,
  ) {
    return await this.auth.resetPassword(user?._id?.toString(), {
      resetToken: dto.resetToken,
      newPassword: dto.newPassword,
      oldPassword: dto.oldPassword,
    });
  }

  @Post('email')
  @UseGuards(AuthGuard)
  async setEmail(@CurrentUser() user: UserDocument, @Body() dto: EmailDto) {
    return await this.auth.setEmail(user, dto.email);
  }

  @Post('email/resend')
  @UseGuards(AuthGuard)
  async resendEmailCode(@CurrentUser() user: UserDocument) {
    return await this.auth.resendEmailCode(user);
  }

  @Post('email/confirm')
  @UseGuards(AuthGuard)
  async confirmEmail(
    @CurrentUser() user: UserDocument,
    @Body() dto: EmailCodeDto,
  ) {
    return await this.auth.confirmEmail(user._id.toString(), dto.code);
  }

  @Post('connect-codeforces')
  @UseGuards(AuthGuard)
  async connectCodeforces(
    @CurrentUser() user: UserDocument,
    @Body() dto: ConnectCodeforcesDto,
  ) {
    return await this.auth.connectCodeforces(user, dto.handle);
  }

  @Post('connect-atcoder')
  @UseGuards(AuthGuard)
  async connectAtcoder(
    @CurrentUser() user: UserDocument,
    @Body() dto: ConnectAtcoderDto,
  ) {
    return await this.auth.connectAtcoder(user, dto.handle);
  }

  @Post('verify-atcoder-profile')
  @UseGuards(AuthGuard)
  async verifyAtcoderProfile(@CurrentUser() user: UserDocument) {
    return await this.auth.verifyAtcoderProfile(user._id.toString());
  }

  @Post('sync-profile')
  @UseGuards(AuthGuard)
  async syncProfile(@CurrentUser() user: UserDocument) {
    return await this.auth.syncProfile(user);
  }

  @Post('generate-verification-code')
  @UseGuards(AuthGuard)
  async generateVerificationCode(@CurrentUser() user: UserDocument) {
    return await this.auth.generateVerificationCode(user._id.toString());
  }

  @Post('verify-codeforces-profile')
  @UseGuards(AuthGuard)
  async verifyCodeforcesProfile(@CurrentUser() user: UserDocument) {
    return await this.auth.verifyCodeforcesProfile(user._id.toString());
  }

  private setRefreshCookie(res: Response, refreshTokenValue: string) {
    const isProduction = this.config.get<string>('NODE_ENV') === 'production';
    res.cookie('refreshToken', refreshTokenValue, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }

  private setAccessTokenCookie(res: Response, accessTokenValue: string) {
    const isProduction = this.config.get<string>('NODE_ENV') === 'production';
    res.cookie('accessToken', accessTokenValue, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });
  }
}
