import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { BookModule } from './book/book.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [AuthModule, BooksModule, BookModule, WalletModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
