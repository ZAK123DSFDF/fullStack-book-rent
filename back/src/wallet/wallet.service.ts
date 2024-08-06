import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getTotalOrMonthlyBalance(
    month?: number,
    year?: number,
  ): Promise<number> {
    try {
      let wallets;

      if (month !== undefined && year !== undefined) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);
        wallets = await this.prisma.wallet.findMany({
          where: {
            customDate: {
              gte: startDate,
              lt: endDate,
            },
          },
        });
      } else {
        wallets = await this.prisma.wallet.findMany();
      }

      const totalBalance = wallets.reduce(
        (sum, wallet) => sum + wallet.balance,
        0,
      );
      return totalBalance;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Could not retrieve wallet balances');
    }
  }
  async getBalanceByRange(
    startMonth: number,
    startYear: number,
    endMonth: number,
    endYear: number,
  ): Promise<number> {
    try {
      const startDate = new Date(startYear, startMonth - 1, 1);
      const endDate = new Date(endYear, endMonth, 1);
      const wallets = await this.prisma.wallet.findMany({
        where: {
          customDate: {
            gte: startDate,
            lt: endDate,
          },
        },
      });
      const totalBalance = wallets.reduce(
        (sum, wallet) => sum + wallet.balance,
        0,
      );
      return totalBalance;
    } catch (error) {
      console.log(error);
      throw new NotFoundException(
        'Could not retrieve wallet balances for the specified range',
      );
    }
  }
  async getUserTotalOrMonthlyBalance(
    userId: any,
    month?: number,
    year?: number,
  ) {
    try {
      let wallets;

      if (month !== undefined && year !== undefined) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);
        wallets = await this.prisma.wallet.findMany({
          where: {
            userId,
            customDate: {
              gte: startDate,
              lt: endDate,
            },
          },
        });
      } else {
        wallets = await this.prisma.wallet.findMany({ where: userId });
      }

      const totalBalance = wallets.reduce(
        (sum, wallet) => sum + wallet.balance,
        0,
      );
      return totalBalance;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getUserBalanceByRange(
    userId: any,
    startMonth: number,
    startYear: number,
    endMonth: number,
    endYear: number,
  ) {
    try {
      const startDate = new Date(startYear, startMonth - 1, 1);
      const endDate = new Date(endYear, endMonth, 1);
      const wallets = await this.prisma.wallet.findMany({
        where: {
          userId,
          customDate: {
            gte: startDate,
            lt: endDate,
          },
        },
      });
      const totalBalance = wallets.reduce(
        (sum, wallet) => sum + wallet.balance,
        0,
      );
      return totalBalance;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
