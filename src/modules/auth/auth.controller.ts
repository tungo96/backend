// src/auth/auth.controller.ts
import {
    Controller, Post, Body, Request, UseGuards, Get, UnauthorizedException
  } from '@nestjs/common';
  import { AuthService } from './auth.service';
  import { JwtAuthGuard } from './jwt-auth.guard';
  
  @Controller('auth')
  export class AuthController {
    constructor(private authService: AuthService) {}
  
    @Post('register')
    async register(@Body() body) {
      try {
        return await this.authService.register(body.email, body.password, body.username, body.type);
      } catch (error) {
        throw new UnauthorizedException(error.message);
      }
    }
  
    @Post('login')
    async login(@Body() body) {
      try {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) {
          throw new UnauthorizedException('Invalid email or password');
        }
        return this.authService.login(user);
      } catch (error) {
        throw new UnauthorizedException(error.message);
      }
    }
  
    @Post('refresh')
    async refreshTokens(@Body('refreshToken') refreshToken: string) {
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token not provided');
      }
      return this.authService.refreshTokens(refreshToken);
    }
  
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
      return req.user;
    }
  }
  