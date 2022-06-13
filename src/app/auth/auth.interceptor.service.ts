import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { exhaustMap, take } from 'rxjs/operators';
import { AuthCredential } from '../users/model/authCredential';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return this.authService.authCredential.pipe(
      take(1),
      exhaustMap((authCred: AuthCredential | null) => {
        if (!authCred) {
          return next.handle(request);
        }

        const modifiedRequest = request.clone({
          headers: request.headers.set(
            'Authorization',
            `Bearer ${authCred._token}`
          ),
        });
        return next.handle(modifiedRequest);
      })
    );
  }
}
