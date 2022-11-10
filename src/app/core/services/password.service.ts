import { catchError, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

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
          return throwError(() => err);
        })
      );
  }

  changePassword(
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ) {
    return this.httpClient
      .post(this.baseUrl + 'auth/change-password', {
        confirmPassword,
        newPassword,
        oldPassword,
      })
      .pipe(
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }
}
