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
        count: z
          .number()
          .int()
          .nonnegative('Count must be a non-negative integer'),
        category: z.string().min(1, 'Category is required'),
      });

      const parsed = bookSchema.safeParse(parsedData);

      console.log('this is the parsed data', parsed);
      if (!parsed.success) {
        throw new BadRequestException(parsed.error.errors);
      }

      const { name, author, price, count, category } = parsed.data;
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
        throw new NotFoundException('Category not found');
      }
      const status = count === 0 ? 'RENTED' : 'FREE';

      const book = await this.prisma.book.create({
        data: {
          name,
          author,
          price,
          count,
          status,
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
      const parsedData = {
        ...bookData,
        price: +bookData.price,
        count: +bookData.count,
      };
      const bookSchema = z.object({
        name: z.string().optional(),
        author: z.string().optional(),
        price: z.number().positive().optional(),
        count: z.number().int().nonnegative().optional(),
        category: z.string().optional(),
      });

      const parsed = bookSchema.safeParse(parsedData);
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

      const status =
        count !== undefined ? (count === 0 ? 'RENTED' : 'FREE') : book.status;

      const updatedBook = await this.prisma.book.update({
        where: { id: bookId },
        data: {
          name,
          author,
          price,
          count,
          status,
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
  async getAllBooks({
    globalSearch,
    bookId,
    ownerName,
    category,
    bookName,
    bookAuthor,
    count,
    price,
    bookStatus,
    status,
    sortBy,
    sortOrder = 'asc',
  }: {
    globalSearch?: string;
    bookId?: number;
    ownerName?: string;
    category?: string;
    bookName?: string;
    bookAuthor?: string;
    count?: number;
    price?: number;
    bookStatus?: 'ACTIVE' | 'INACTIVE';
    status?: 'FREE' | 'RENTED';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<any> {
    try {
      const filter: any = {};

      if (globalSearch && globalSearch.trim() !== '') {
        const numericSearch = Number(globalSearch);
        filter.OR = [];

        if (!isNaN(numericSearch)) {
          filter.OR.push(
            { id: numericSearch },
            { count: numericSearch },
            { price: numericSearch },
          );
        }
        filter.OR.push(
          { name: { contains: globalSearch, mode: 'insensitive' } },
          { author: { contains: globalSearch, mode: 'insensitive' } },
          {
            owner: {
              name: { contains: globalSearch, mode: 'insensitive' },
            },
          },
          {
            category: {
              name: { contains: globalSearch, mode: 'insensitive' },
            },
          },
        );
      }

      if (bookId !== undefined) {
        filter.id = bookId;
      }
      if (ownerName && ownerName.trim() !== '') {
        filter.owner = {
          name: { contains: ownerName, mode: 'insensitive' },
        };
      }
      if (category && category.trim() !== '') {
        filter.category = {
          name: { contains: category, mode: 'insensitive' },
        };
      }
      if (count !== undefined) {
        filter.count = count;
      }
      if (price !== undefined) {
        filter.price = price;
      }
      if (bookName && bookName.trim() !== '') {
        filter.name = { contains: bookName, mode: 'insensitive' };
      }
      if (bookAuthor && bookAuthor.trim() !== '') {
        filter.author = { contains: bookAuthor, mode: 'insensitive' };
      }
      const validBookStatus = ['ACTIVE', 'INACTIVE'];
      if (bookStatus && validBookStatus.includes(bookStatus)) {
        filter.bookStatus = bookStatus;
      }
      const validStatus = ['FREE', 'RENTED'];
      if (status && validStatus.includes(status)) {
        filter.status = status;
      }
      const validSortOrders: ('asc' | 'desc')[] = ['asc', 'desc'];
      sortOrder = validSortOrders.includes(sortOrder) ? sortOrder : 'asc';
      const validSortFields = [
        'id',
        'name',
        'author',
        'count',
        'price',
        'bookStatus',
        'status',
      ];
      const sortOptions: any[] = [];
      if (sortBy && validSortFields.includes(sortBy)) {
        sortOptions.push({ [sortBy]: sortOrder });
      } else if (sortBy === 'ownerName') {
        sortOptions.push({ owner: { name: sortOrder } });
      } else if (sortBy === 'category') {
        sortOptions.push({ category: { name: sortOrder } });
      } else {
        sortOptions.push({ id: 'asc' });
      }

      const books = await this.prisma.book.findMany({
        where: filter,
        orderBy: sortOptions,
        include: {
          owner: true,
          category: true,
        },
      });

      return books;
    } catch (error) {
      console.error(error);
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
      if (book.bookStatus !== 'ACTIVE') {
        throw new ForbiddenException('The book is not active');
      }
      if (
        book.owner.userStatus !== 'VERIFIED' ||
        book.owner.updateStatus !== 'ACTIVE'
      ) {
        throw new ForbiddenException('The owner of this book is not active');
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
          userId: book.owner.id,
          balance: bookPrice,
          customDate: parsedDate,
        },
      });
      const newCount = book.count - 1;
      const status = newCount === 0 ? 'RENTED' : book.status;
      const updatedBook = await this.prisma.book.update({
        where: { id: bookId },
        data: {
          count: newCount,
          status,
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
  async getUserBooks({
    userId,
    globalSearch,
    bookId,
    category,
    bookName,
    bookAuthor,
    count,
    price,
    bookStatus,
    status,
    sortBy,
    sortOrder = 'asc',
  }: {
    userId: number;
    globalSearch?: string;
    bookId?: number;
    category?: string;
    bookName?: string;
    bookAuthor?: string;
    count?: number;
    price?: number;
    bookStatus?: 'ACTIVE' | 'INACTIVE';
    status?: 'FREE' | 'RENTED';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<any> {
    try {
      const filter: any = { ownerId: userId };

      if (globalSearch && globalSearch.trim() !== '') {
        const numericSearch = Number(globalSearch);
        filter.OR = [];

        if (!isNaN(numericSearch)) {
          filter.OR.push(
            { id: numericSearch },
            { count: numericSearch },
            { price: numericSearch },
          );
        }
        filter.OR.push(
          { name: { contains: globalSearch, mode: 'insensitive' } },
          { author: { contains: globalSearch, mode: 'insensitive' } },
          {
            category: { name: { contains: globalSearch, mode: 'insensitive' } },
          },
        );
      }

      if (bookId !== undefined) {
        filter.OR = filter.OR || [];
        filter.OR.push({ id: bookId });
      }
      if (category && category.trim() !== '') {
        filter.category = {
          name: { contains: category, mode: 'insensitive' },
        };
      }
      if (count !== undefined) {
        filter.OR = filter.OR || [];
        filter.OR.push({ count: count });
      }
      if (price !== undefined) {
        filter.OR = filter.OR || [];
        filter.OR.push({ price: price });
      }
      if (bookName && bookName.trim() !== '') {
        filter.OR = filter.OR || [];
        filter.OR.push({ name: { contains: bookName, mode: 'insensitive' } });
      }
      if (bookAuthor && bookAuthor.trim() !== '') {
        filter.OR = filter.OR || [];
        filter.OR.push({
          author: { contains: bookAuthor, mode: 'insensitive' },
        });
      }
      const validBookStatus = ['ACTIVE', 'INACTIVE'];
      if (bookStatus && validBookStatus.includes(bookStatus)) {
        filter.bookStatus = bookStatus;
      }
      const validStatus = ['FREE', 'RENTED'];
      if (status && validStatus.includes(status)) {
        filter.status = status;
      }
      const validSortFields = ['id', 'name', 'author', 'count', 'price'];
      const validSortOrders: ('asc' | 'desc')[] = ['asc', 'desc'];
      sortOrder = validSortOrders.includes(sortOrder) ? sortOrder : 'asc';
      const sortOptions: any[] = [];
      if (sortBy && validSortFields.includes(sortBy)) {
        sortOptions.push({ [sortBy]: sortOrder });
      } else if (sortBy === 'category') {
        sortOptions.push({ category: { name: sortOrder } });
      } else {
        sortOptions.push({ id: 'asc' });
      }

      let books = await this.prisma.book.findMany({
        where: filter,
        orderBy: sortOptions,
        include: {
          category: true,
        },
      });
      return books;
    } catch (error) {
      console.error(error);
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
      const allCategories = await this.prisma.category.findMany();
      const allCategoryMap = new Map(
        allCategories.map((cat) => [cat.id, cat.name]),
      );
      const categoryCounts = await this.prisma.book.groupBy({
        by: ['categoryId'],
        _count: {
          _all: true,
        },
        where: {
          ownerId: userId,
        },
      });
      const categoryCountMap = new Map(
        categoryCounts.map((count) => [count.categoryId, count._count._all]),
      );
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
  async activateBook(bookId: any) {
    try {
      const verifyBook = this.prisma.book.update({
        where: { id: bookId },
        data: { bookStatus: 'ACTIVE' },
      });
      return verifyBook;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async deactivateBook(bookId: any) {
    try {
      const unverifyBook = this.prisma.book.update({
        where: { id: bookId },
        data: { bookStatus: 'INACTIVE' },
      });
      return unverifyBook;
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
