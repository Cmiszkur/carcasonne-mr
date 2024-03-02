import { UserAbstract } from './user-abstract';

export type SafeUser = Omit<UserAbstract, 'password'>;
