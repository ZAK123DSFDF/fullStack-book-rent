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
export class BooksController {
  constructor(private readonly bookService: BookService) {}
  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createBook(@Request() req, @Response() res, @Body() bookData: any) {
    const userId = req.cookies['token'].user;
    if (!userId) {
      throw new BadRequestException('Invalid token');
    }
    const createdBook = this.bookService.createBook(userId, bookData);
    res.status(200).json({ createdBook });
  }
  @Patch('updateBook/:bookId')
  @UseGuards(JwtAuthGuard)
  async updateBook(
    @Request() req,
    @Response() res,
    @Param('bookId') bookId: number,
    @Body() bookData: any,
  ) {
    const userId = req.cookies['token'].user;
    if (!userId) {
      throw new BadRequestException('Invalid token');
    }
    const updatedBook = this.bookService.updateBook(userId, bookId, bookData);

    res.status(200).json({ updatedBook });
  }
  @Delete('deleteBook/:bookId')
  @UseGuards(JwtAuthGuard)
  async deleteBook(
    @Request() req,
    @Response() res,
    @Param('bookId') bookId: number,
  ) {
    const userId = req.cookies['token'].user;
    if (!userId) {
      throw new BadRequestException('Invalid token');
    }
    this.bookService.deleteBook(userId, bookId);
    res.status(200).json('book deleted');
  }
  @Get('AllBooks')
  @UseGuards(JwtAuthGuard)
  async getAllBooks(
    @Request() req,
    @Response() res,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('status') status?: string,
  ) {
    try {
      const role = req.cookies['token'].role;
      if (role !== 'ADMIN') {
        throw new ForbiddenException('You are not an admin');
      }
      const allBooks = await this.bookService.getAllBooks(
        search,
        category,
        minPrice,
        maxPrice,
        status,
      );
      res.status(200).json({ allBooks });
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
    const book = this.bookService.rentBook(bookId, body.purchaseDate);
    res.status(200).json({ book });
  }
  @Get('getBookSearch')
  async getBookSearch(@Response() res) {
    try {
      const allBooks = this.bookService.getAllBooksSearch();
      res.status(200).json({ allBooks });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Get('getUserBooks')
  @UseGuards(JwtAuthGuard)
  async getUserBooks(@Request() req, @Response() res) {
    try {
      const userId = req.cookies['token'].user;
      const getUserBooks = this.bookService.getUserBooks(userId);
      res.status(200).json({ getUserBooks });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
