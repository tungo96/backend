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
      const user = await this.usersService.findByEmail(email);
      console.log(user);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid password');
      }

      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async login(user: any) {
    try {
      const payload = { username: user.email, sub: user.id };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        }
      };
    } catch (error) {
      throw new UnauthorizedException('Error generating token');
    }
  }

  async register(email: string, password: string) {
    try {
      // Kiểm tra email đã tồn tại
      const existingUser = await this.usersService.findByEmail(email);
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      // Mã hóa password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Tạo user mới
      const user = await this.usersService.create({
        email,
        password: hashedPassword,
        username: email.split('@')[0] // Tạo username từ email
      });

      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new UnauthorizedException('Error creating user');
    }
  }
}
