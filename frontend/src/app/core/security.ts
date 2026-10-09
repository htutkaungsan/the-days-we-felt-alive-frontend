import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Auth } from './auth';
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth),
    router = inject(Router);
  const isApi = req.url.startsWith('/api/v1/');
  if (isApi && auth.token())
    req = req.clone({ setHeaders: { Authorization: 'Bearer ' + auth.token() } });
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (isApi && error.status === 401 && !req.url.endsWith('/auth/login')) {
        auth.logout();
        void router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
export const customerGuard: CanActivateFn = () => {
  const auth = inject(Auth),
    router = inject(Router);
  return auth.user()?.role === 'customer' || router.createUrlTree(['/login']);
};
export const adminGuard: CanActivateFn = () => {
  const auth = inject(Auth),
    router = inject(Router);
  return auth.user()?.role === 'admin' || router.createUrlTree(['/login']);
};
