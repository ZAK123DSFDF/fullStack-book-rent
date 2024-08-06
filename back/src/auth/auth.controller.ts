import {
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
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwt: JwtService,
  ) {}
  @Post('signup')
  async createUser(@Response() res, @Body() userData: any) {
    try {
      const { user, token } = await this.authService.createUser(userData);
      res.cookie('token', token, { httpOnly: true });
      res.status(200).json({
        user,
        token,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Post('login')
  async Login(@Response() res, @Body() userData: any) {
    try {
      const { user, token } = await this.authService.validateUser(userData);
      res.cookie('token', token, { httpOnly: true });
      res.status(200).json({
        user,
        token,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Get('logout')
  async logout(@Response() res) {
    try {
      res.clearCookie('token');
      console.log('logout successful');
      res.status(200).json({
        message: 'logout successful',
      });
    } catch (error) {
      console.log(error);
      res.status(500).json(error.message);
    }
  }
  @Get('check')
  @UseGuards(JwtAuthGuard)
  async isAuthenticated(@Request() req, @Response() res) {
    try {
      const decode = this.jwt.decode(req.cookies['token']);
      res.status(200).json({
        isAuthenticated: true,
        id: decode.user,
        email: decode.email,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Patch('verifyUser/:userId')
  async verifyUser(
    @Param('userId') userId: number,
    @Request() req,
    @Response() res,
  ) {
    try {
      const token = req.cookies['token'];
      const decoded = this.jwt.decode(token);
      const role = decoded.role;
      if (role !== 'ADMIN') {
        throw new ForbiddenException('You are not an admin');
      }
      const updatedUser = await this.authService.verifyUser(userId);
      res.status(200).json(updatedUser);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Delete('deleteUser/:userId')
  async deleteUser(
    @Param('userId') userId: number,
    @Request() req,
    @Response() res,
  ) {
    const token = req.cookies['token'];
    const decoded = this.jwt.decode(token);
    const role = decoded.role;
    if (role !== 'ADMIN') {
      throw new ForbiddenException('You are not an admin');
    }
    try {
      await this.authService.deleteUser(userId);
      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Get('all')
  @UseGuards(JwtAuthGuard)
  async getUsers(
    @Request() req,
    @Response() res,
    @Query('search') search?: string,
    @Query('location') location?: string,
    @Query('userStatus') userStatus?: string,
  ) {
    try {
      const role = req.cookies['token'].role;
      if (role !== 'ADMIN') {
        throw new ForbiddenException('You are not an admin');
      }
      const users = await this.authService.getUsers(
        search,
        location,
        userStatus,
      );
      res.status(200).json({ users });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
