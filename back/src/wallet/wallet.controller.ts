import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Query,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private jwt: JwtService,
  ) {}
  @Get('balance')
  @UseGuards(JwtAuthGuard)
  async getBalance(
    @Request() req,
    @Response() res,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ): Promise<any> {
    try {
      const token = req.cookies['token'];
      const decoded = this.jwt.decode(token);
      const role = decoded.role;
      if (role !== 'ADMIN') {
        throw new ForbiddenException('You are not an admin');
      }
      const balance = await this.walletService.getTotalOrMonthlyBalance(
        month,
        year,
      );
      res.status(200).json(balance);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Get('balanceByRange')
  @UseGuards(JwtAuthGuard)
  async getBalanceByRange(
    @Request() req,
    @Response() res,
    @Query('startMonth') startMonth?: number,
    @Query('startYear') startYear?: number,
    @Query('endMonth') endMonth?: number,
    @Query('endYear') endYear?: number,
  ) {
    try {
      const token = req.cookies['token'];
      const decoded = this.jwt.decode(token);
      const role = decoded.role;
      if (role !== 'ADMIN') {
        throw new ForbiddenException('You are not an admin');
      }
      const currentDate = new Date();
      const defaultStartYear = 1900;
      const defaultStartMonth = 1;
      const defaultEndYear = currentDate.getFullYear();
      const defaultEndMonth = currentDate.getMonth() + 1;

      const validStartMonth =
        startMonth && startMonth >= 1 && startMonth <= 12
          ? startMonth
          : defaultStartMonth;
      const validStartYear =
        startYear && startYear >= 1900 ? startYear : defaultStartYear;
      const validEndMonth =
        endMonth && endMonth >= 1 && endMonth <= 12
          ? endMonth
          : defaultEndMonth;
      const validEndYear =
        endYear && endYear >= 1900 ? endYear : defaultEndYear;
      if (
        new Date(validStartYear, validStartMonth - 1) >
        new Date(validEndYear, validEndMonth - 1)
      ) {
        throw new BadRequestException('Invalid date range');
      }
      const totalBalance = await this.walletService.getBalanceByRange(
        validStartMonth,
        validStartYear,
        validEndMonth,
        validEndYear,
      );
      res.status(200).json(totalBalance);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Get('userBalance')
  @UseGuards(JwtAuthGuard)
  async getUserBalance(
    @Request() req,
    @Response() res,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ): Promise<any> {
    try {
      const token = req.cookies['token'];
      const decoded = this.jwt.decode(token);
      const userId = decoded.user;
      const balance = await this.walletService.getUserTotalOrMonthlyBalance(
        userId,
        month,
        year,
      );
      res.status(200).json(balance);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Get('userBalanceByRange')
  @UseGuards(JwtAuthGuard)
  async getUserBalanceByRange(
    @Request() req,
    @Response() res,
    @Query('startMonth') startMonth?: number,
    @Query('startYear') startYear?: number,
    @Query('endMonth') endMonth?: number,
    @Query('endYear') endYear?: number,
  ) {
    try {
      const token = req.cookies['token'];
      const decoded = this.jwt.decode(token);
      const userId = decoded.user;
      const currentDate = new Date();
      const defaultStartYear = 1900;
      const defaultStartMonth = 1;
      const defaultEndYear = currentDate.getFullYear();
      const defaultEndMonth = currentDate.getMonth() + 1;

      const validStartMonth =
        startMonth && startMonth >= 1 && startMonth <= 12
          ? startMonth
          : defaultStartMonth;
      const validStartYear =
        startYear && startYear >= 1900 ? startYear : defaultStartYear;
      const validEndMonth =
        endMonth && endMonth >= 1 && endMonth <= 12
          ? endMonth
          : defaultEndMonth;
      const validEndYear =
        endYear && endYear >= 1900 ? endYear : defaultEndYear;
      if (
        new Date(validStartYear, validStartMonth - 1) >
        new Date(validEndYear, validEndMonth - 1)
      ) {
        throw new BadRequestException('Invalid date range');
      }

      const totalBalance = await this.walletService.getUserBalanceByRange(
        userId,
        validStartMonth,
        validStartYear,
        validEndMonth,
        validEndYear,
      );
      res.status(200).json(totalBalance);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
