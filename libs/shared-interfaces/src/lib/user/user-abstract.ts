export abstract class UserAbstract {
  abstract email: string;
  abstract username: string;
  abstract password: string;
  abstract lastCreatedRoom?: string;
  abstract emailPendingConfirmation?: string;
}
