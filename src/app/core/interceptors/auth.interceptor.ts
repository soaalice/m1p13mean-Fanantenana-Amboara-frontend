import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const PUBLIC_PATHS = ['/login', '/register', '/403', '/404'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const currentUrl = router.url;
      const isOnPublicPage = PUBLIC_PATHS.some(p => currentUrl.startsWith(p));

      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }

      if (error.status === 403 && !isOnPublicPage) {
        router.navigate(['/403']);
      }

      return throwError(() => error);
    })
  );
};
