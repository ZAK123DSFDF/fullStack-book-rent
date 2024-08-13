import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getTotalOrMonthlyBalance(): Promise<{
    currentMonthTotal: number;
    lastMonthTotal: number;
    percentageChange: number;
    dollarChange: number;
  }> {
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // Months are zero-indexed

      // Calculate totals for the current month
      const startDateCurrentMonth = new Date(currentYear, currentMonth - 1, 1);
      const endDateCurrentMonth = new Date(currentYear, currentMonth, 1);
      const walletsCurrentMonth = await this.prisma.wallet.findMany({
        where: {
          customDate: {
            gte: startDateCurrentMonth,
            lt: endDateCurrentMonth,
          },
        },
      });
      const totalBalanceCurrentMonth = walletsCurrentMonth.reduce(
        (sum, wallet) => sum + wallet.balance,
        0,
      );

      // Calculate totals for the previous month
      const startDateLastMonth = new Date(currentYear, currentMonth - 2, 1);
      const endDateLastMonth = new Date(currentYear, currentMonth - 1, 1);
      const walletsLastMonth = await this.prisma.wallet.findMany({
        where: {
          customDate: {
            gte: startDateLastMonth,
            lt: endDateLastMonth,
          },
        },
      });
      const totalBalanceLastMonth = walletsLastMonth.reduce(
        (sum, wallet) => sum + wallet.balance,
        0,
      );

      // Calculate percentage change
      const percentageChange =
        totalBalanceLastMonth === 0
          ? totalBalanceCurrentMonth > 0
            ? 100 // If last month was zero and current month is positive, it's 100% increase
            : 0
          : ((totalBalanceCurrentMonth - totalBalanceLastMonth) /
              totalBalanceLastMonth) *
            100;

      // Calculate dollar change
      const dollarChange = totalBalanceCurrentMonth - totalBalanceLastMonth;

      return {
        currentMonthTotal: totalBalanceCurrentMonth,
        lastMonthTotal: totalBalanceLastMonth,
        percentageChange: parseFloat(percentageChange.toFixed(2)), // Round to 2 decimal places
        dollarChange: parseFloat(dollarChange.toFixed(2)), // Round to 2 decimal places
      };
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Could not retrieve wallet balances');
    }
  }
  async getBalanceByRange(
    startDate: string, // Format: YYYY-MM-DD
    endDate: string, // Format: YYYY-MM-DD
  ): Promise<any> {
    try {
      // Parse input dates
      const startDateCurrent = new Date(startDate);
      const endDateCurrent = new Date(endDate);

      // Fetch data for the current range
      const walletsCurrent = await this.prisma.wallet.findMany({
        where: {
          customDate: {
            gte: startDateCurrent,
            lt: new Date(endDateCurrent.getTime() + 86400000), // Inclusive of the end date
          },
        },
      });

      // Initialize object to hold the monthly balances for the current range
      const monthlyBalancesCurrent: Record<string, number> = {};

      // Aggregate the balance by month
      walletsCurrent.forEach((wallet) => {
        const month = wallet.customDate.getMonth() + 1; // Month is zero-indexed, so add 1
        const year = wallet.customDate.getFullYear();
        const key = `${year}-${month.toString().padStart(2, '0')}`; // Ensure two digits for month
        if (!monthlyBalancesCurrent[key]) {
          monthlyBalancesCurrent[key] = 0;
        }
        monthlyBalancesCurrent[key] += wallet.balance;
      });

      // Compute the previous year's date range
      const startDateLastYear = new Date(startDateCurrent);
      startDateLastYear.setFullYear(startDateLastYear.getFullYear() - 1);

      const endDateLastYear = new Date(endDateCurrent);
      endDateLastYear.setFullYear(endDateLastYear.getFullYear() - 1);

      // Fetch data for the last year range
      const walletsLastYear = await this.prisma.wallet.findMany({
        where: {
          customDate: {
            gte: startDateLastYear,
            lt: new Date(endDateLastYear.getTime() + 86400000), // Inclusive of the end date
          },
        },
      });

      // Initialize object to hold the monthly balances for the last year
      const monthlyBalancesLastYear: Record<string, number> = {};

      // Aggregate the balance by month for the last year
      walletsLastYear.forEach((wallet) => {
        const month = wallet.customDate.getMonth() + 1; // Month is zero-indexed, so add 1
        const year = wallet.customDate.getFullYear();
        const key = `${year}-${month.toString().padStart(2, '0')}`; // Ensure two digits for month
        if (!monthlyBalancesLastYear[key]) {
          monthlyBalancesLastYear[key] = 0;
        }
        monthlyBalancesLastYear[key] += wallet.balance;
      });

      return {
        currentYearBalances: monthlyBalancesCurrent,
        lastYearBalances: monthlyBalancesLastYear,
        startDate,
        endDate,
        startDateLastYear,
        endDateLastYear,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getUserTotalOrMonthlyBalance(userId: number): Promise<{
    currentMonthTotal: number;
    lastMonthTotal: number;
    percentageChange: number;
    dollarChange: number; // Add this line
  }> {
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // Months are zero-indexed

      // Calculate totals for the current month
      const startDateCurrentMonth = new Date(currentYear, currentMonth - 1, 1);
      const endDateCurrentMonth = new Date(currentYear, currentMonth, 1);
      const walletsCurrentMonth = await this.prisma.wallet.findMany({
        where: {
          userId: userId,
          customDate: {
            gte: startDateCurrentMonth,
            lt: endDateCurrentMonth,
          },
        },
      });
      const totalBalanceCurrentMonth = walletsCurrentMonth.reduce(
        (sum, wallet) => sum + wallet.balance,
        0,
      );

      // Calculate totals for the previous month
      const startDateLastMonth = new Date(currentYear, currentMonth - 2, 1);
      const endDateLastMonth = new Date(currentYear, currentMonth - 1, 1);
      const walletsLastMonth = await this.prisma.wallet.findMany({
        where: {
          userId: userId,
          customDate: {
            gte: startDateLastMonth,
            lt: endDateLastMonth,
          },
        },
      });
      const totalBalanceLastMonth = walletsLastMonth.reduce(
        (sum, wallet) => sum + wallet.balance,
        0,
      );

      // Calculate percentage change
      const percentageChange =
        totalBalanceLastMonth === 0
          ? totalBalanceCurrentMonth > 0
            ? 100 // If last month was zero and current month is positive, it's 100% increase
            : 0
          : ((totalBalanceCurrentMonth - totalBalanceLastMonth) /
              totalBalanceLastMonth) *
            100;

      // Calculate dollar change
      const dollarChange = totalBalanceCurrentMonth - totalBalanceLastMonth;

      return {
        currentMonthTotal: totalBalanceCurrentMonth,
        lastMonthTotal: totalBalanceLastMonth,
        percentageChange: parseFloat(percentageChange.toFixed(2)), // Round to 2 decimal places
        dollarChange: parseFloat(dollarChange.toFixed(2)), // Round to 2 decimal places
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getUserMonthlyBalancesByRange(
    userId: any,
    startDate: string, // Format: YYYY-MM-DD
    endDate: string, // Format: YYYY-MM-DD
  ) {
    try {
      // Parse input dates
      const startDateCurrent = new Date(startDate);
      const endDateCurrent = new Date(endDate);

      // Fetch data for the current range
      const walletsCurrent = await this.prisma.wallet.findMany({
        where: {
          userId: userId,
          customDate: {
            gte: startDateCurrent,
            lt: new Date(endDateCurrent.getTime() + 86400000), // Inclusive of the end date
          },
        },
      });

      // Initialize object to hold the monthly balances for the current range
      const monthlyBalancesCurrent: Record<string, number> = {};

      // Aggregate the balance by month
      walletsCurrent.forEach((wallet) => {
        const month = wallet.customDate.getMonth() + 1; // Month is zero-indexed, so add 1
        const year = wallet.customDate.getFullYear();
        const key = `${year}-${month.toString().padStart(2, '0')}`; // Ensure two digits for month
        if (!monthlyBalancesCurrent[key]) {
          monthlyBalancesCurrent[key] = 0;
        }
        monthlyBalancesCurrent[key] += wallet.balance;
      });

      // Compute the previous year's date range
      const startDateLastYear = new Date(startDateCurrent);
      startDateLastYear.setFullYear(startDateLastYear.getFullYear() - 1);

      const endDateLastYear = new Date(endDateCurrent);
      endDateLastYear.setFullYear(endDateLastYear.getFullYear() - 1);

      // Fetch data for the last year range
      const walletsLastYear = await this.prisma.wallet.findMany({
        where: {
          userId: userId,
          customDate: {
            gte: startDateLastYear,
            lt: new Date(endDateLastYear.getTime() + 86400000), // Inclusive of the end date
          },
        },
      });

      // Initialize object to hold the monthly balances for the last year
      const monthlyBalancesLastYear: Record<string, number> = {};

      // Aggregate the balance by month for the last year
      walletsLastYear.forEach((wallet) => {
        const month = wallet.customDate.getMonth() + 1; // Month is zero-indexed, so add 1
        const year = wallet.customDate.getFullYear();
        const key = `${year}-${month.toString().padStart(2, '0')}`; // Ensure two digits for month
        if (!monthlyBalancesLastYear[key]) {
          monthlyBalancesLastYear[key] = 0;
        }
        monthlyBalancesLastYear[key] += wallet.balance;
      });

      return {
        currentYearBalances: monthlyBalancesCurrent,
        lastYearBalances: monthlyBalancesLastYear,
        startDate,
        endDate,
        startDateLastYear,
        endDateLastYear,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
