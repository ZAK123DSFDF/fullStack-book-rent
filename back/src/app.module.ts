import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BookModule } from './book/book.module';
import { WalletModule } from './wallet/wallet.module';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';

@Module({
  imports: [AuthModule, BookModule, BookModule, WalletModule],
  controllers: [AppController],
  providers: [AppService, JwtService, PrismaService],
})
export class AppModule {}
