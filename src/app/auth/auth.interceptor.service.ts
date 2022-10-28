import { ToastrService } from 'ngx-toastr';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { LoginResponse } from '../core/models/user.model';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    request = request.clone({
      headers: request.headers.set(
        'Authorization',
        'Bearer ' + this.authService.jwtToken()
      ),
    });

    return next.handle(request).pipe(
      catchError((error) => {
        if (
          error instanceof HttpErrorResponse &&
          !request.url.includes('login') &&
          error.status === 401
        ) {
          return this.handle401Error(request, next);
        } else if (error.status == '403') {
          this.toastr.error(error.error.message);
          this.authService.logout();
        }

        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;

      if (this.authService.isAuthenticated()) {
        return this.authService.getRefreshToken().pipe(
          switchMap((response) => {
            this.isRefreshing = false;
            return next.handle(this.addToken(request, response));
          }),
          catchError((error) => {
            this.isRefreshing = false;

            if (error.status == '403') {
              this.authService.logout();
            }

            return throwError(() => error);
          })
        );
      }
    }

    return next.handle(request);
  }
  addToken(
    request: HttpRequest<unknown>,
    response: LoginResponse
  ): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${response.jwtToken}`,
      },
    });
  }
}
