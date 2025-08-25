import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HashingService } from 'src/shared/services/hashing.service';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService
  ) { }

  async login(loginDto: any) {
    try {
      const existedUser = await this.prismaService.user.findUnique({
        where: {
          email: loginDto.email
        }
      })

      if (!existedUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const isPasswordMatch = await this.hashingService.compare(loginDto.password, existedUser.password);
      if (!isPasswordMatch) {
        throw new HttpException('Password is incorrect', HttpStatus.BAD_REQUEST);
      }

      return {
        success: true,
        message: 'Login Sucessful',
        token: 'Token nek'
      };
    } catch (error) {
      console.error("🚀 ~ AuthService ~ login ~ error:", error)
      throw error;
    }
  }

}
