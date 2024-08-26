import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { BookService } from './book.service';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { PoliciesGuard } from 'src/guards/Policies.guard';
import { CheckPolicies } from 'src/decorators/CheckPolicies';
import { AppAbility } from 'src/casl/casl-ability.factory';
import { Action } from 'src/utils/enum';
import { Book } from 'src/classes/Book';
import { All } from 'src/classes/All';

@Controller('book')
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private jwt: JwtService,
  ) {}
  @Post('create')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, Book))
  async createBook(@Request() req, @Response() res, @Body() bookData: any) {
    try {
      const token = req.cookies['token'];
      const decoded = this.jwt.decode(token);
      const userId = decoded.user;
      const createdBook = await this.bookService.createBook(userId, bookData);
      res.status(200).json(createdBook);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Patch('updateBook/:bookId')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Book))
  async updateBook(
    @Request() req,
    @Response() res,
    @Param('bookId') bookId: number,
    @Body() bookData: any,
  ) {
    try {
      const token = req.cookies['token'];
      const decoded = this.jwt.decode(token);
      const userId = decoded.user;
      const bookIdInt = +bookId;
      const updatedBook = await this.bookService.updateBook(
        userId,
        bookIdInt,
        bookData,
      );

      res.status(200).json(updatedBook);
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }
  @Delete('deleteBook/:bookId')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Book))
  async deleteBook(
    @Request() req,
    @Response() res,
    @Param('bookId') bookId: number,
  ) {
    try {
      const token = req.cookies['token'];
      const decoded = this.jwt.decode(token);
      const userId = decoded.user;
      const bookIdInt = +bookId;
      await this.bookService.deleteBook(userId, bookIdInt);
      res.status(200).json('book deleted');
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Get('allBooks')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, All))
  async getAllBooks(
    @Request() req,
    @Response() res,
    @Query('globalSearch') globalSearch?: string,
    @Query('bookId') bookId?: string,
    @Query('ownerName') ownerName?: string,
    @Query('category') category?: string,
    @Query('bookName') bookName?: string,
    @Query('bookAuthor') bookAuthor?: string,
    @Query('count') count?: string,
    @Query('price') price?: string,
    @Query('bookStatus') bookStatus?: 'ACTIVE' | 'INACTIVE',
    @Query('status') status?: 'FREE' | 'RENTED',
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    try {
      console.log('Fetching books with global and specific search');
      const numericBookId = bookId ? Number(bookId) : undefined;
      const numericCount = count ? Number(count) : undefined;
      const numericPrice = price ? Number(price) : undefined;
      const books = await this.bookService.getAllBooks({
        globalSearch,
        bookId: numericBookId,
        ownerName,
        category,
        bookName,
        bookAuthor,
        count: numericCount,
        price: numericPrice,
        bookStatus,
        status,
        sortBy,
        sortOrder,
      });

      res.status(200).json(books);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Post('rent/:bookId')
  async rentBook(
    @Response() res,
    @Param('bookId') bookId: number,
    @Body() body: { purchaseDate?: string },
  ) {
    try {
      const bookIdInt = +bookId;
      const book = await this.bookService.rentBook(
        bookIdInt,
        body.purchaseDate,
      );
      res.status(200).json(book);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Get('getBookSearch')
  async getBookSearch(@Response() res) {
    try {
      const allBooks = await this.bookService.getAllBooksSearch();
      res.status(200).json(allBooks);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Get('getUserBooks')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, Book))
  async getUserBooks(
    @Request() req,
    @Response() res,
    @Query('globalSearch') globalSearch?: string,
    @Query('bookId') bookId?: string,
    @Query('bookName') bookName?: string,
    @Query('category') category?: string,
    @Query('bookAuthor') bookAuthor?: string,
    @Query('count') count?: string,
    @Query('price') price?: string,
    @Query('bookStatus') bookStatus?: 'ACTIVE' | 'INACTIVE',
    @Query('status') status?: 'FREE' | 'RENTED',
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    try {
      const token = req.cookies['token'];
      const decoded = this.jwt.decode(token);
      const userId = decoded.user;

      const numericBookId = bookId ? Number(bookId) : undefined;
      const numericCount = count ? Number(count) : undefined;
      const numericPrice = price ? Number(price) : undefined;

      const userBooks = await this.bookService.getUserBooks({
        userId,
        globalSearch,
        bookId: numericBookId,
        category,
        bookName,
        bookAuthor,
        count: numericCount,
        price: numericPrice,
        bookStatus,
        status,
        sortBy,
        sortOrder,
      });

      res.status(200).json(userBooks);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Get('GetBookCategoryCount')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, All))
  async GetBookCategoryCount(@Request() req, @Response() res) {
    try {
      const bookCount = await this.bookService.getCategoryCounts();
      res.status(200).json(bookCount);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Get('getUserCategoryCount')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Book))
  async getUserCategoryCount(@Request() req, @Response() res) {
    try {
      const token = req.cookies['token'];
      const decoded = this.jwt.decode(token);
      const userId = decoded.user;
      const userCategoryCount =
        await this.bookService.getUserCategoryCounts(userId);
      res.status(200).json(userCategoryCount);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Patch('activateBook/:bookId')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, All))
  async verifyBook(
    @Request() req,
    @Response() res,
    @Param('bookId') bookId: any,
  ) {
    try {
      const bookIdInt = +bookId;
      const verifyBook = await this.bookService.activateBook(bookIdInt);
      res.status(200).json(verifyBook);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Patch('deactivateBook/:bookId')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, All))
  async unverifyBook(
    @Request() req,
    @Response() res,
    @Param('bookId') bookId: any,
  ) {
    try {
      const bookIdInt = +bookId;
      const verifyBook = await this.bookService.deactivateBook(bookIdInt);
      res.status(200).json(verifyBook);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Get('getSingleBook/:bookId')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, Book))
  async getSingleBook(
    @Request() req,
    @Response() res,
    @Param('bookId') bookId: any,
  ) {
    try {
      const bookIdInt = +bookId;
      const SingleBook = await this.bookService.getSingleBook(bookIdInt);
      res.status(200).json(SingleBook);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
