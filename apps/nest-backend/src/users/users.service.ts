import { LeanUser, RegisterResponse } from '@nest-backend/src/interfaces';
import { User, UserDocument } from './schemas/user.schema';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateWriteOpResult } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  saltRounds = 10;
  response: RegisterResponse = { message: '', error: '' };

  async create(createUser: User): Promise<User> {
    const plainPassword = createUser.password;
    const username = createUser.username;
    const user = await this.userModel.findOne({ username: username });

    if (user) {
      this.response = { ...this.response, error: 'Username already taken' };
      throw new HttpException('User already exist', HttpStatus.CONFLICT);
    }

    if (
      createUser.email.length > 30 ||
      plainPassword.length > 30 ||
      username.length > 15 ||
      !createUser.email ||
      !plainPassword ||
      !username
    ) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    const salt = await bcrypt.genSalt(this.saltRounds).catch((err: Error) => {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    });
    const hash = await bcrypt.hash(plainPassword, salt).catch((err: Error) => {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    });
    createUser.password = hash;
    const createdUser = await new this.userModel(createUser).save().catch((err: Error) => {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    });

    console.log(createdUser, new User(createUser));

    return new User(createUser);
  }

  async findOne(username: string): Promise<LeanUser> {
    return this.userModel.findOne({ username: username }).select('-__v').lean();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).lean();
  }

  async checkIfRoomCreatedByUser(username: string): Promise<string | null> {
    return (await this.findOne(username))?.lastCreatedRoom || null;
  }

  async updateUser(username: string, userPayload: Partial<User>): Promise<UpdateWriteOpResult> {
    return this.userModel.updateOne({ username: username }, userPayload);
  }
}
