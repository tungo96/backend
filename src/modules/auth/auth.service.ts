// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    try {
      const user = await this.usersService.findOneByEmail(email);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid password');
      }
      return user; // Return the full user object including password for hashing refresh token
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(user.id, { refreshToken: hashedRefreshToken });

    return {
      accessToken,
      refreshToken,
    };
  }

  async register(email: string, password: string, username: string, type: string) {
    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const newUser = await this.usersService.create({
      email,
      password,
      username,
      type,
    });

    const { password: _, ...result } = newUser;
    return result;
  }

  async refreshTokens(refreshToken: string) {
    const decoded = this.jwtService.decode(refreshToken);

    if (!decoded || typeof decoded === 'string' || !decoded.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const userId = decoded.sub;
    const user = await this.usersService.findOneById(userId);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Refresh token malformed or user not found');
    }

    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Refresh token invalid');
    }

    const payload = { username: user.username, sub: user.id };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const newRefreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);
    await this.usersService.update(user.id, { refreshToken: hashedNewRefreshToken });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
