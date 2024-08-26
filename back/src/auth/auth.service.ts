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
      if (!email || !password) {
        throw new BadRequestException('Email and password are required');
      }
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
  async activateUser(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const activateUser = await this.prisma.user.update({
        where: { id: userId },
        data: { updateStatus: 'ACTIVE' },
      });
      return activateUser;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async deactivateUser(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const activateUser = await this.prisma.user.update({
        where: { id: userId },
        data: { updateStatus: 'INACTIVE' },
      });
      return activateUser;
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
  async getUsers({
    globalSearch,
    userId,
    userName,
    userLocation,
    userEmail,
    userPhoneNumber,
    uploadNumber,
    userStatus,
    updateStatus,
    sortBy,
    sortOrder = 'asc',
  }: {
    globalSearch?: string;
    userId?: number;
    userName?: string;
    userLocation?: string;
    userEmail?: string;
    userPhoneNumber?: string;
    uploadNumber?: number;
    userStatus?: 'VERIFIED' | 'NOTVERIFIED';
    updateStatus?: 'ACTIVE' | 'INACTIVE';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<any> {
    try {
      const filter: any = {};

      if (globalSearch && globalSearch.trim() !== '') {
        const numericSearch = Number(globalSearch);
        filter.OR = [];

        if (!isNaN(numericSearch)) {
          filter.OR.push(
            { id: numericSearch },
            { uploadNumber: numericSearch },
          );
        }
        filter.OR.push(
          { name: { contains: globalSearch, mode: 'insensitive' } },
          { email: { contains: globalSearch, mode: 'insensitive' } },
          { location: { contains: globalSearch, mode: 'insensitive' } },
          { phoneNumber: { contains: globalSearch, mode: 'insensitive' } },
        );
      }

      if (userId !== undefined) {
        filter.OR = filter.OR || [];
        filter.OR.push({ id: userId });
      }
      if (uploadNumber !== undefined) {
        filter.OR = filter.OR || [];
        filter.OR.push({ uploadNumber: uploadNumber });
      }
      if (userName && userName.trim() !== '') {
        filter.OR = filter.OR || [];
        filter.OR.push({ name: { contains: userName, mode: 'insensitive' } });
      }
      if (userLocation && userLocation.trim() !== '') {
        filter.OR = filter.OR || [];
        filter.OR.push({
          location: { contains: userLocation, mode: 'insensitive' },
        });
      }
      if (userEmail && userEmail.trim() !== '') {
        filter.OR = filter.OR || [];
        filter.OR.push({ email: { contains: userEmail, mode: 'insensitive' } });
      }
      if (userPhoneNumber && userPhoneNumber.trim() !== '') {
        filter.OR = filter.OR || [];
        filter.OR.push({
          phoneNumber: { contains: userPhoneNumber, mode: 'insensitive' },
        });
      }
      const validStatus = ['VERIFIED', 'NOTVERIFIED'];
      if (userStatus && validStatus.includes(userStatus)) {
        filter.userStatus = userStatus;
      }
      const validUpdateStatus = ['ACTIVE', 'INACTIVE'];
      if (updateStatus && validUpdateStatus.includes(updateStatus)) {
        filter.updateStatus = updateStatus;
      }
      filter.role = { not: 'ADMIN' };
      const validSortFields = [
        'id',
        'name',
        'email',
        'location',
        'phoneNumber',
        'uploadNumber',
      ];
      const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'id';
      const validSortOrders: ('asc' | 'desc')[] = ['asc', 'desc'];
      const actualSortOrder = validSortOrders.includes(sortOrder)
        ? sortOrder
        : 'asc';
      const sortOptions: any = {
        [actualSortBy]: actualSortOrder,
      };

      const users = await this.prisma.user.findMany({
        where: filter,
        orderBy: sortOptions,
      });

      return users;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getSingleUser(userId: any) {
    try {
      const singleUser = this.prisma.user.findUnique({ where: { id: userId } });
      return singleUser;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
