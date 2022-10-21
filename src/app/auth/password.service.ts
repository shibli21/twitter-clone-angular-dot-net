import { catchError, throwError } from 'rxjs';
import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PasswordService {
  baseUrl = environment.baseUrl;

  constructor(private httpClient: HttpClient) {}

  forgotPassword(email: string, resetPasswordUrl: string) {
    return this.httpClient.post(this.baseUrl + 'auth/forgot-password', {
      email,
      resetPasswordUrl,
    });
  }

  resetPassword(password: string, confirmPassword: string, token: string) {
    return this.httpClient
      .post(this.baseUrl + 'auth/reset-password', {
        confirmPassword,
        password,
        token,
      })
      .pipe(
        catchError((err) => {
          return throwError(err);
        })
      );
  }
}
