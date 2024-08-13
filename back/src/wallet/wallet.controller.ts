import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { PoliciesGuard } from 'src/guards/Policies.guard';
import { CheckPolicies } from 'src/decorators/CheckPolicies';
import { AppAbility } from 'src/casl/casl-ability.factory';
import { Action } from 'src/utils/enum';
import { Book } from 'src/classes/Book';
import { All } from 'src/classes/All';

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private jwt: JwtService,
  ) {}
  @Get('balance')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, All))
  async getBalance(@Request() req, @Response() res): Promise<any> {
    try {
      const balanceData = await this.walletService.getTotalOrMonthlyBalance();
      res.status(200).json(balanceData);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }
  @Get('balanceByRange')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, All))
  async getBalanceByRange(
    @Request() req,
    @Response() res,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const defaultStartDate = new Date(
        new Date().setFullYear(new Date().getFullYear() - 1),
      );
      const defaultEndDate = new Date();
      const parsedStartDate = startDate
        ? new Date(startDate)
        : defaultStartDate;
      const parsedEndDate = endDate ? new Date(endDate) : defaultEndDate;
      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        throw new BadRequestException('Invalid date format');
      }

      if (parsedStartDate > parsedEndDate) {
        throw new BadRequestException('Start date must be before end date');
      }

      const totalBalance = await this.walletService.getBalanceByRange(
        parsedStartDate.toISOString().split('T')[0],
        parsedEndDate.toISOString().split('T')[0],
      );

      res.status(200).json(totalBalance);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Get('userBalance')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Book))
  async getUserBalance(@Request() req, @Response() res): Promise<any> {
    try {
      const token = req.cookies['token'];
      const decoded = this.jwt.decode(token);
      const userId = decoded.user;
      const balanceData =
        await this.walletService.getUserTotalOrMonthlyBalance(userId);

      res.status(200).json(balanceData);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }
  @Get('userMonthlyBalancesByRange')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Book))
  async getUserMonthlyBalancesByRange(
    @Request() req,
    @Response() res,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const token = req.cookies['token'];
      const decoded = this.jwt.decode(token);
      const userId = decoded.user;
      const defaultStartDate = new Date(
        new Date().setFullYear(new Date().getFullYear() - 1),
      );
      const defaultEndDate = new Date();
      const parsedStartDate = startDate
        ? new Date(startDate)
        : defaultStartDate;
      const parsedEndDate = endDate ? new Date(endDate) : defaultEndDate;
      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        throw new BadRequestException('Invalid date format');
      }

      if (parsedStartDate > parsedEndDate) {
        throw new BadRequestException('Start date must be before end date');
      }

      const monthlyBalances =
        await this.walletService.getUserMonthlyBalancesByRange(
          userId,
          parsedStartDate.toISOString().split('T')[0],
          parsedEndDate.toISOString().split('T')[0],
        );

      res.status(200).json(monthlyBalances);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
