import { Inject, Injectable } from '@nestjs/common';
import { IRepoCollab } from '@app/domain/IRepository/IRepoCollab';
import { MongoClientWrapper } from '@app/mongo/mongo.client.wrapper';
import { Collab } from '@app/domain/model/Collab';
import { CollabEmail } from '@app/domain/model/collab.email';
import { UserError } from '@app/domain/model/errors/user.error';

export const USER_COLLECTION = 'users';

@Injectable()
export class CollabRepository implements IRepoCollab {
  constructor(
    @Inject(MongoClientWrapper)
    private wrapper: MongoClientWrapper,
  ) {}

  async findAll(): Promise<Collab[]> {
    const usersCollection = this.wrapper.db.collection<{ _id: string }>(
      'users',
    );

    const allUsers = [];
    for await (const userDoc of usersCollection.find()) {
      allUsers.push(Collab.fromJson(userDoc));
    }

    return allUsers;
  }

  async findById(id: CollabEmail): Promise<Collab> {
    const usersCollection = this.wrapper.db.collection<{ _id: string }>(
      'users',
    );
    const foundUser = await usersCollection.findOne({
      _id: id.value,
    });

    if (!foundUser) {
      throw new Error(`User "${id.value}" not found`);
    }

    return Collab.fromJson(foundUser);
  }

  async findByIds(ids: CollabEmail[]): Promise<Collab[]> {
    const usersCollection = this.wrapper.db.collection<{ _id: string }>(
      'users',
    );

    const allUsers = [];
    const findCursor = usersCollection.find({
      _id: { $in: ids.map((email) => email.value) },
    });

    for await (const userDoc of findCursor) {
      allUsers.push(Collab.fromJson(userDoc));
    }

    return allUsers;
  }

  async save(user: Collab): Promise<void> {
    const doc = {
      _id: user.email.value,
      ...user,
    };

    try {
      await this.wrapper.getCollection(USER_COLLECTION).insertOne(doc);
    } catch (error: any) {
      // duplicate error in mongo code
      if (error.message.includes('E11000')) {
        throw new UserError(`Duplicate user with code ${user.email.value}`);
      }
      throw error;
    }
  }
}
