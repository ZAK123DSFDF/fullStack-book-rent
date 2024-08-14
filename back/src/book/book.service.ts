import {
  All,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { z } from 'zod';

@Injectable()
export class BookService {
  constructor(private prisma: PrismaService) {}
  async createBook(userId: number, bookData: any): Promise<any> {
    try {
      const parsedData = {
        ...bookData,
        price: +bookData.price,
        count: +bookData.count,
      };
      const bookSchema = z.object({
        name: z.string().min(1, 'Name is required'),
        author: z.string().min(1, 'Author is required'),
        price: z.number().positive('Price must be a positive number'),
        count: z.number().int().positive('Count must be a positive integer'),
        category: z.string().min(1, 'Category is required'),
      });

      const parsed = bookSchema.safeParse(parsedData);

      console.log('this is the parsed data', parsed);
      if (!parsed.success) {
        throw new BadRequestException(parsed.error.errors);
      }

      const { name, author, price, count, category } = parsed.data;
      console.log(
        typeof name,
        typeof author,
        typeof price,
        typeof count,
        typeof category,
      );
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (user.userStatus !== 'VERIFIED') {
        throw new ForbiddenException('You are not verified');
      }

      let existingCategory = await this.prisma.category.findUnique({
        where: { name: category },
      });
      if (!existingCategory) {
        throw new NotFoundException('category not found');
      }
      const book = await this.prisma.book.create({
        data: {
          name,
          author,
          price,
          count,
          category: {
            connect: { id: existingCategory.id },
          },
          owner: { connect: { id: userId } },
        },
      });
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          uploadNumber: {
            increment: 1,
          },
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
        count: z.number().int().nonnegative().optional(),
        category: z.string().optional(),
      });

      const parsed = bookSchema.safeParse(bookData);
      if (!parsed.success) {
        throw new BadRequestException(parsed.error.errors);
      }

      const { name, author, price, count, category } = parsed.data;

      const book = await this.prisma.book.findUnique({ where: { id: bookId } });
      if (!book) {
        throw new NotFoundException('Book not found');
      }

      if (book.ownerId !== userId) {
        throw new BadRequestException(
          'You are not authorized to update this book',
        );
      }
      let existingCategory = undefined;
      if (category) {
        existingCategory = await this.prisma.category.findUnique({
          where: { name: category },
        });

        if (!existingCategory) {
          throw new NotFoundException('Category not found');
        }
      }

      const updatedBook = await this.prisma.book.update({
        where: { id: bookId },
        data: {
          name,
          author,
          price,
          count,
          category: existingCategory
            ? {
                connect: { id: existingCategory.id },
              }
            : undefined,
        },
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

      if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};

        if (minPrice !== undefined) {
          filter.price.gte = minPrice;
        }

        if (maxPrice !== undefined) {
          filter.price.lte = maxPrice;
        }
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
      if (book.bookStatus !== 'VERIFIED') {
        throw new ForbiddenException('The book is not verified');
      }
      if (book.count <= 0) {
        throw new BadRequestException('No copies available');
      }
      const bookPrice = book.price;
      if (isNaN(bookPrice)) {
        throw new BadRequestException('Invalid book price');
      }
      const wallet = await this.prisma.wallet.create({
        data: {
          userId,
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
      const books = this.prisma.book.findMany({ include: { category: true } });
      return books;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getUserBooks(
    userId: any,
    search?: string,
    minPrice?: number,
    maxPrice?: number,
    status?: string,
  ): Promise<any> {
    try {
      const filter: any = { ownerId: userId };

      if (search) {
        filter.name = { contains: search, mode: 'insensitive' };
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

      const userBooks = await this.prisma.book.findMany({
        where: filter,
      });

      return userBooks;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getCategoryCounts(): Promise<any[]> {
    try {
      const categoryCounts = await this.prisma.category.findMany({
        include: {
          _count: {
            select: { books: true },
          },
        },
      });
      const bookCount = categoryCounts.map((category) => ({
        name: category.name,
        bookCount: category._count.books,
      }));
      return bookCount;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getUserCategoryCounts(userId: any): Promise<any[]> {
    try {
      // Step 1: Fetch all categories
      const allCategories = await this.prisma.category.findMany();
      const allCategoryMap = new Map(
        allCategories.map((cat) => [cat.id, cat.name]),
      );

      // Step 2: Fetch category counts for the user
      const categoryCounts = await this.prisma.book.groupBy({
        by: ['categoryId'],
        _count: {
          _all: true,
        },
        where: {
          ownerId: userId,
        },
      });

      // Step 3: Create a map from category ID to count
      const categoryCountMap = new Map(
        categoryCounts.map((count) => [count.categoryId, count._count._all]),
      );

      // Step 4: Combine results ensuring all categories are included
      const result = allCategories.map((cat) => ({
        name: cat.name,
        bookCount: categoryCountMap.get(cat.id) || 0,
      }));

      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async verifyBook(bookId: any) {
    try {
      const verifyBook = this.prisma.book.update({
        where: { id: bookId },
        data: { bookStatus: 'VERIFIED' },
      });
      return verifyBook;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getSingleBook(bookId: any) {
    try {
      const SingleBook = this.prisma.book.findUnique({
        where: { id: bookId },
        include: { category: true },
      });
      return SingleBook;
    } catch (error) {
      throw error;
    }
  }
}
