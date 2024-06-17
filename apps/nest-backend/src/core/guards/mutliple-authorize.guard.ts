import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Type,
  UnauthorizedException,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { Observable, catchError, forkJoin, from, isObservable, map, of } from 'rxjs';

@Injectable()
export class MultipleAuthorizeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly moduleRef: ModuleRef) {}

  public canActivate(context: ExecutionContext): Observable<boolean> {
    const allowedGuards =
      this.reflector.get<Type<CanActivate>[]>('multipleGuardsReferences', context.getHandler()) ||
      [];
    const guards = allowedGuards.map((guardReference) =>
      this.moduleRef.get<CanActivate>(guardReference, { strict: false })
    );

    if (guards.length === 0) {
      return of(true);
    }

    if (guards.length === 1) {
      return guards[0].canActivate(context) as Observable<boolean>;
    }

    const checks$: Observable<boolean>[] = guards.map((guard) => {
      let guard$: Observable<boolean>;
      const canActivate = guard.canActivate(context);

      if (this.isObservable(canActivate)) {
        guard$ = canActivate;
      }

      if (this.isPromise(canActivate)) {
        guard$ = from(canActivate);
      }

      if (typeof canActivate === 'boolean') {
        guard$ = of(canActivate);
      }

      return guard$.pipe(
        catchError((err) => {
          if (err instanceof UnauthorizedException) {
            return of(false);
          }
          throw err;
        })
      );
    });

    return forkJoin(checks$).pipe(map((results: boolean[]) => results.some(Boolean)));
  }

  private isPromise<T>(value: unknown): value is Promise<T> {
    return value && typeof value['then'] === 'function';
  }

  private isObservable<T>(value: unknown): value is Observable<T> {
    return isObservable(value);
  }
}
