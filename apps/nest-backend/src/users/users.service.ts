import { LeanUser, RegisterResponse } from '@nest-backend/src/interfaces';
import { User, UserDocument } from './schemas/user.schema';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery, UpdateWithAggregationPipeline, UpdateWriteOpResult } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';
import { randomUUID } from 'crypto';
import { RegistrationResponse } from '@carcasonne-mr/shared-interfaces';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private mailService: MailService
  ) {}

  saltRounds = 10;
  response: RegisterResponse = { message: '', error: '' };

  async create(createUser: User): Promise<RegistrationResponse> {
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
    const createdUser = await new this.userModel({
      ...createUser,
      password: hash,
      emailPendingConfirmation: true,
    })
      .save()
      .catch((err: Error) => {
        throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
      });

    const confirmation = await this.mailService
      .sendUserConfirmation(createdUser, randomUUID())
      .catch((err: Error) => {
        throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
      });

    return {
      ...new User(createdUser.toObject()),
      emailConfirmationId: confirmation._id.toString(),
      expiresAfter: confirmation.expiresAfter,
      issuedAt: confirmation.issuedAt,
    };
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

  async updateUser(
    username: string,
    userPayload: UpdateQuery<User> | UpdateWithAggregationPipeline
  ): Promise<UpdateWriteOpResult> {
    return this.userModel.updateOne({ username: username }, userPayload);
  }

  public async confirmUsersEmail(token: string) {
    const confirmation = await this.mailService.findConfirmation(token).catch((err: Error) => {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    });

    console.log('confirmation', confirmation);

    if (!token || !confirmation) {
      throw new HttpException(
        'Email already confirmed or wrong token was provided',
        HttpStatus.BAD_REQUEST
      );
    }

    const user = confirmation.user;

    try {
      await this.updateUser(user.username, {
        $unset: { ['emailPendingConfirmation']: 1 },
      });
      console.log('updated user', user);
      await this.mailService.deleteConfirmation(token);
      return new User(user);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
