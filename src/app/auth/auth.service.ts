import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../users/model/user';
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
  user = new BehaviorSubject<User | null>(null);

  private tokenExpirationTimer: any;
  baseUrl = environment.baseUrl + '/user/';

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
      .post<LoginResponseData>(
        this.baseUrl + `login`,
        {
          email: email,
          password: password,
        },
        {
          withCredentials: true,
        }
      )
      .pipe(
        catchError((error) => {
          return throwError(error);
        }),
        tap((resData) => {
          this.handleAuthentication(resData.token, resData.expires);
        })
      );
  }

  currentUser() {
    return this.http.get<User>(this.baseUrl + 'current-user').pipe(
      catchError((error) => {
        return throwError(error);
      }),
      tap((resData) => {
        this.user.next(resData);
      })
    );
  }

  private handleAuthentication(token: string, expirationDate: Date) {
    const authCredential = new AuthCredential(token, expirationDate);

    this.authCredential.next(authCredential);

    const expiresIn = moment(expirationDate)
      .subtract(moment.duration(2, 'minute'))
      .diff(new Date(), 'seconds');
    this.autoLogout(expiresIn * 1000);

    localStorage.setItem('authData', JSON.stringify(authCredential));

    this.currentUser().subscribe((user) => {
      this.user.next(user);
    });
  }

  logout() {
    this.http
      .delete(this.baseUrl + 'logout', { withCredentials: true })
      .subscribe();

    this.authCredential.next(null);
    this.router.navigate(['/login']);
    localStorage.removeItem('authData');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.user.next(null);
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.getRefreshToken().subscribe();
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
      this.currentUser().subscribe((user) => {
        this.user.next(user);
      });
    }
  }

  getRefreshToken() {
    return this.http
      .post<LoginResponseData>(
        this.baseUrl + 'refresh-token',
        {},
        {
          withCredentials: true,
        }
      )
      .pipe(
        catchError((error) => {
          this.logout();
          return throwError(error);
        }),
        tap((resData) => {
          this.handleAuthentication(resData.token, resData.expires);
        })
      );
  }
}
