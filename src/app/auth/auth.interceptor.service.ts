import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginResponse } from './Models/user.model';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const userAuthData = localStorage.getItem('userData');

    if (!userAuthData) {
      return next.handle(request);
    }

    const { jwtToken } = JSON.parse(userAuthData) as LoginResponse;

    const modifiedRequest = request.clone({
      headers: request.headers.set('Authorization', 'Bearer ' + jwtToken),
    });

    return next.handle(modifiedRequest);
  }
}
