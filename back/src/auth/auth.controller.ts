import {
  All,
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
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { PoliciesGuard } from 'src/guards/Policies.guard';
import { CheckPolicies } from 'src/decorators/CheckPolicies';
import { AppAbility } from 'src/casl/casl-ability.factory';
import { Action } from 'src/utils/enum';
import { Users } from 'src/classes/Users';

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
      res.status(200).json({ user, token });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Post('login')
  async Login(@Response() res, @Body() userData: any) {
    try {
      console.log(userData);
      const { user, token } = await this.authService.validateUser(userData);
      res.cookie('token', token, { httpOnly: true });
      res.status(200).json({ user, token });
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
      res.status(200).json('logout successful');
    } catch (error) {
      console.log(error);
      res.status(500).json(error.message);
    }
  }
  @Get('check')
  async isAuthenticated(@Request() req, @Response() res) {
    try {
      const decode = this.jwt.decode(req.cookies['token']);
      res.status(200).json({
        isAuthenticated: true,
        id: decode.user,
        email: decode.email,
        role: decode.role,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Patch('verifyUser/:userId')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Users))
  async verifyUser(
    @Param('userId') userId: number,
    @Request() req,
    @Response() res,
  ) {
    try {
      const userIdInt = +userId;
      const updatedUser = await this.authService.verifyUser(userIdInt);
      res.status(200).json(updatedUser);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Delete('deleteUser/:userId')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Users))
  async deleteUser(
    @Param('userId') userId: number,
    @Request() req,
    @Response() res,
  ) {
    try {
      const token = req.cookies['token'];
      const decoded = this.jwt.decode(token);
      const id = decoded.user;
      const userIdInt = +userId;
      if (userIdInt === id) {
        throw new BadRequestException('you can not delete yourself');
      }
      await this.authService.deleteUser(userIdInt);
      return res.status(200).json('User deleted successfully');
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Get('all')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Users))
  async getUsers(
    @Request() req,
    @Response() res,
    @Query('search') search?: string,
    @Query('location') location?: string,
    @Query('userStatus') userStatus?: string,
  ) {
    try {
      console.log('this is user');
      const users = await this.authService.getUsers(
        search,
        location,
        userStatus,
      );
      res.status(200).json(users);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Get('singleUser/:userId')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Users))
  async getSingle(
    @Request() req,
    @Response() res,
    @Param('userId') userId?: string,
  ) {
    try {
      const userIdInt = parseInt(userId, 10);
      const singleUser = await this.authService.getSingleUser(userIdInt);
      res.status(200).json(singleUser);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
