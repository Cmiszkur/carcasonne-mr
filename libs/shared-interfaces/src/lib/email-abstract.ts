import { UserAbstract } from '@carcasonne-mr/shared-interfaces';

export abstract class EmailAbstract {
  public abstract readonly token: string;
  public abstract readonly issuedAt: Date;
  public abstract readonly expiresAfter: Date;
  public abstract readonly user: UserAbstract;
}
