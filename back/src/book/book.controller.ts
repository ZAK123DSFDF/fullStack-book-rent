import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('book')
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private jwt: JwtService,
  ) {}
  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createBook(@Request() req, @Response() res, @Body() bookData: any) {
    try {
      const token = req.cookies['token'];
      const decoded = this.jwt.decode(token);
      const userId = decoded.user;
      if (!userId) {
        throw new BadRequestException('Invalid token');
      }
      const createdBook = await this.bookService.createBook(userId, bookData);
      res.status(200).json(createdBook);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Patch('updateBook/:bookId')
  @UseGuards(JwtAuthGuard)
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
      if (!userId) {
        throw new BadRequestException('Invalid token');
      }
      const bookIdInt = +bookId;
      const updatedBook = await this.bookService.updateBook(
        userId,
        bookIdInt,
        bookData,
      );

      res.status(200).json(updatedBook);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Delete('deleteBook/:bookId')
  @UseGuards(JwtAuthGuard)
  async deleteBook(
    @Request() req,
    @Response() res,
    @Param('bookId') bookId: number,
  ) {
    try {
      const token = req.cookies['token'];
      const decoded = this.jwt.decode(token);
      const userId = decoded.user;
      if (!userId) {
        throw new BadRequestException('Invalid token');
      }
      const bookIdInt = +bookId;
      await this.bookService.deleteBook(userId, bookIdInt);
      res.status(200).json('book deleted');
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Get('AllBooks')
  @UseGuards(JwtAuthGuard)
  async getAllBooks(
    @Request() req,
    @Response() res,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('status') status?: string,
  ) {
    try {
      const token = req.cookies['token'];
      const decoded = this.jwt.decode(token);
      const role = decoded.role;
      if (role !== 'ADMIN') {
        throw new ForbiddenException('You are not an admin');
      }
      const min = minPrice ? parseInt(minPrice, 10) : undefined;
      const max = maxPrice ? parseInt(maxPrice, 10) : undefined;
      const allBooks = await this.bookService.getAllBooks(
        search,
        category,
        min,
        max,
        status,
      );

      res.status(200).json(allBooks);
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
  @UseGuards(JwtAuthGuard)
  async getUserBooks(
    @Request() req,
    @Response() res,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('status') status?: string,
  ) {
    try {
      const token = req.cookies['token'];
      const decoded = this.jwt.decode(token);
      const userId = decoded.user;
      const min = minPrice ? parseInt(minPrice, 10) : undefined;
      const max = maxPrice ? parseInt(maxPrice, 10) : undefined;
      const getUserBooks = await this.bookService.getUserBooks(
        userId,
        search,
        min,
        max,
        status,
      );

      res.status(200).json(getUserBooks);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Get('GetBookCategoryCount')
  @UseGuards(JwtAuthGuard)
  async GetBookCategoryCount(@Request() req, @Response() res) {
    try {
      const token = req.cookies['token'];
      const decoded = this.jwt.decode(token);
      const role = decoded.role;
      if (role !== 'ADMIN') {
        throw new ForbiddenException('You are not an admin');
      }
      const bookCount = await this.bookService.getCategoryCounts();
      res.status(200).json(bookCount);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Get('getUserCategoryCount')
  @UseGuards(JwtAuthGuard)
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
  @Patch('verifyBook/:bookId')
  @UseGuards(JwtAuthGuard)
  async verifyBook(
    @Request() req,
    @Response() res,
    @Param('bookId') bookId: any,
  ) {
    try {
      const token = req.cookies['token'];
      const decoded = this.jwt.decode(token);
      const role = decoded.role;
      if (role !== 'ADMIN') {
        throw new ForbiddenException('You are not an admin');
      }
      const bookIdInt = +bookId;
      const verifyBook = await this.bookService.verifyBook(bookIdInt);
      res.status(200).json(verifyBook);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
