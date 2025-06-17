import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string; // Changed from 'name' to 'username' based on user.entity.ts

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  type: string; // Added 'type' based on user.entity.ts

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
} 