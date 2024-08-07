import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { z } from 'zod';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}
  async createUser(userData: any): Promise<any> {
    try {
      const SignupSchema = z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        location: z.string(),
        phoneNumber: z.string(),
      });
      const parsed = SignupSchema.safeParse(userData);
      if (!parsed.success) {
        throw new BadRequestException(parsed.error.errors);
      }
      const { name, email, password, location, phoneNumber } = parsed.data;
      const existUser = await this.prisma.user.findUnique({ where: { email } });
      if (existUser) {
        throw new ConflictException('Email already exists');
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          location,
          phoneNumber,
        },
      });
      const token = this.jwt.sign(
        { user: user.id, email: user.email, role: user.role },
        { secret: process.env.secret },
      );
      return { user, token };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async validateUser(userData: any): Promise<any> {
    try {
      const { email, password } = userData;
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new NotFoundException('user not found');
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        throw new BadRequestException('credentials not correct');
      }
      const token = this.jwt.sign(
        { user: user.id, email: user.email, role: user.role },
        { secret: process.env.secret },
      );
      return { user, token };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async verifyUser(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const verifyUser = await this.prisma.user.update({
        where: { id: userId },
        data: { userStatus: 'VERIFIED' },
      });
      return verifyUser;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async deleteUser(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      await this.prisma.user.delete({ where: { id: userId } });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getUsers(
    search?: string,
    location?: string,
    userStatus?: string,
  ): Promise<any> {
    try {
      const filter: any = {};

      if (search) {
        filter.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (location) {
        filter.location = { contains: location, mode: 'insensitive' };
      }
      if (userStatus) {
        filter.userStatus = userStatus;
      }
      filter.role = { not: 'ADMIN' };
      const users = await this.prisma.user.findMany({ where: filter });
      return users;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
