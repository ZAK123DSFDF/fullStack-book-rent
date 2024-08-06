import {
  All,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { z } from 'zod';

@Injectable()
export class BookService {
  constructor(private prisma: PrismaService) {}
  async createBook(userId: any, bookData: any): Promise<any> {
    try {
      const bookSchema = z.object({
        name: z.string().min(1, 'Name is required'),
        author: z.string().min(1, 'Author is required'),
        price: z.number().positive('Price must be a positive number'),
        count: z.number().int().positive('Count must be a positive integer'),
        category: z.string(),
      });
      const parsed = bookSchema.safeParse(bookData);
      if (!parsed.success) {
        throw new BadRequestException(parsed.error.errors);
      }
      const { name, author, price, count, category } = parsed.data;
      const book = await this.prisma.book.create({
        data: {
          name,
          author,
          price,
          count,
          category,
          ownerId: userId,
        },
      });
      return book;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async updateBook(
    userId: number,
    bookId: number,
    bookData: any,
  ): Promise<any> {
    try {
      const bookSchema = z.object({
        name: z.string().optional(),
        author: z.string().optional(),
        price: z.number().positive().optional(),
        count: z.number().int().positive().optional(),
        categoryId: z.number().int().positive().optional(),
      });
      const parsed = bookSchema.safeParse(bookData);
      if (!parsed.success) {
        throw new BadRequestException(parsed.error.errors);
      }
      const book = await this.prisma.book.findUnique({ where: { id: bookId } });
      if (!book) {
        throw new NotFoundException('Book not found');
      }
      if (book.ownerId !== userId) {
        throw new BadRequestException(
          'You are not authorized to update this book',
        );
      }
      const updatedBook = await this.prisma.book.update({
        where: { id: bookId },
        data: parsed.data,
      });

      return updatedBook;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async deleteBook(userId: number, bookId: number): Promise<any> {
    try {
      const book = await this.prisma.book.findUnique({ where: { id: bookId } });
      if (!book) {
        throw new NotFoundException('Book not found');
      }
      if (book.ownerId !== userId) {
        throw new BadRequestException(
          'You are not authorized to delete this book',
        );
      }
      await this.prisma.book.delete({ where: { id: bookId } });
      return { message: 'Book deleted successfully' };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getAllBooks(
    search?: string,
    category?: string,
    minPrice?: number,
    maxPrice?: number,
    status?: string,
  ): Promise<any> {
    try {
      const filter: any = {};

      if (search) {
        filter.name = { contains: search, mode: 'insensitive' };
      }
      if (category) {
        filter.category = { name: { contains: category, mode: 'insensitive' } };
      }
      if (minPrice !== undefined) {
        filter.price = { gte: minPrice };
      }
      if (maxPrice !== undefined) {
        filter.price = { ...filter.price, lte: maxPrice };
      }
      if (status) {
        filter.status = status;
      }
      const allBooks = await this.prisma.book.findMany({ where: filter });
      return allBooks;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async rentBook(bookId: number, purchaseDate?: string): Promise<any> {
    try {
      const parsedDate = purchaseDate ? new Date(purchaseDate) : new Date();
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException('Invalid date format');
      }
      const book = await this.prisma.book.findUnique({
        where: { id: bookId },
        include: { owner: true },
      });
      if (!book) {
        throw new NotFoundException('Book not found');
      }
      const userId = book.owner.id;
      if (book.count <= 0) {
        throw new BadRequestException('No copies available');
      }
      const bookPrice = parseFloat(book.price);
      if (isNaN(bookPrice)) {
        throw new BadRequestException('Invalid book price');
      }
      const wallet = await this.prisma.wallet.create({
        data: {
          userId: userId,
          balance: bookPrice,
          customDate: parsedDate,
        },
      });
      const updatedBook = await this.prisma.book.update({
        where: { id: bookId },
        data: {
          count: book.count - 1,
        },
      });
      return { wallet, updatedBook };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getAllBooksSearch() {
    try {
      const books = this.prisma.book.findMany();
      return books;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getUserBooks(userId: any) {
    try {
      const userBooks = this.prisma.book.findMany({
        where: { ownerId: userId },
      });
      return userBooks;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
