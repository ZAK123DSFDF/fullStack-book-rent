import {
  createMongoAbility,
  MongoAbility,
  AbilityBuilder,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { All } from 'src/classes/All';
import { Book } from 'src/classes/Book';
import { Users } from 'src/classes/Users';
import { Action } from 'src/utils/enum';

type Subjects = InferSubjects<typeof Book | typeof Users | typeof All>;

export type AppAbility = MongoAbility<[Action, Subjects]>;
@Injectable()
export class CaslAbilityFactory {
  createForUser(user: { role: string; user: number }): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<
      MongoAbility<[Action, Subjects]>
    >(createMongoAbility);

    if (user.role === 'ADMIN') {
      can(Action.Manage, All);
      can(Action.Update, Users);
    } else if (user.role === 'OWNER') {
      can(Action.Update, Book, { authorId: user.user });
      can(Action.Manage, Book);
    }

    return build({
      detectSubjectType: (item: any) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
