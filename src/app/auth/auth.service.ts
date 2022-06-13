import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthCredential } from './../users/model/authCredential';

export interface RegisterResponseData {
  username: string;
  email: string;
  confirmPassword: string;
  password: string;
  dateOfBirth: Date;
}

export interface LoginResponseData {
  token: string;
  expires: Date;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  authCredential = new BehaviorSubject<AuthCredential | null>(null);
  private tokenExpirationTimer: any;
  baseUrl = 'http://noobmasters.learnathon.net/api1/api/user/';

  constructor(private http: HttpClient, private router: Router) {}

  register(
    username: string,
    email: string,
    password: string,
    confirmPassword: string,
    dateOfBirth: Date
  ) {
    return this.http
      .post(this.baseUrl + 'register', {
        username: username,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
        dateOfBirth: dateOfBirth,
      })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  login(email: string, password: string) {
    return this.http
      .post<LoginResponseData>(this.baseUrl + `login`, {
        email: email,
        password: password,
      })
      .pipe(
        catchError((error) => {
          return throwError(error);
        }),
        tap((resData) => {
          this.handleAuthentication(resData.token, resData.expires);
        })
      );
  }

  private handleAuthentication(token: string, expirationDate: Date) {
    const authCredential = new AuthCredential(token, expirationDate);
    this.authCredential.next(authCredential);

    const expiresIn = moment(expirationDate).diff(new Date(), 'seconds');
    this.autoLogout(expiresIn * 1000);

    localStorage.setItem('authData', JSON.stringify(authCredential));
  }

  logout() {
    this.authCredential.next(null);
    this.router.navigate(['/login']);
    localStorage.removeItem('authData');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  autoLogin() {
    const authData: AuthCredential = JSON.parse(
      localStorage.getItem('authData') as any
    );

    if (!authData) {
      return;
    }

    const loadedUser = new AuthCredential(
      authData._token,
      new Date(authData._tokenExpirationDate)
    );

    if (loadedUser.token) {
      this.authCredential.next(loadedUser);
      const expirationDuration =
        new Date(authData._tokenExpirationDate).getTime() -
        new Date().getTime();
      this.autoLogout(expirationDuration);
    }
  }
}
