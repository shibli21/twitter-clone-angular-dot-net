import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';

import {
  ILoginUser,
  IRegisterUser,
  LoginResponse,
  User,
} from '../core/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user = new BehaviorSubject<User | null>(null);
  private tokenExpirationTimer: string | number | NodeJS.Timeout | undefined;

  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient, private router: Router) {}

  registerUser(registerUser: IRegisterUser) {
    return this.http.post(this.baseUrl + 'auth/register', registerUser).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  loginUser(loginUser: ILoginUser) {
    return this.http
      .post<LoginResponse>(this.baseUrl + 'auth/login', loginUser, {
        withCredentials: true,
      })
      .pipe(
        tap((loginResponse) => {
          this.handleAuthentication(loginResponse);
        })
      );
  }

  isAuthenticated() {
    return this.user.value !== null;
  }

  isAdmin() {
    return this.user.value?.role === 'admin';
  }

  userId() {
    return this.user.value?.id;
  }

  currentUserValue() {
    return this.user.value;
  }

  handleAuthentication(loginResponse: LoginResponse) {
    this.autoLogout(loginResponse.jwtExpiresIn);

    localStorage.setItem('userData', JSON.stringify(loginResponse));

    this.currentUser().subscribe((user) => {
      if (user.role === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  currentUser() {
    return this.http.get<User>(this.baseUrl + 'users/current-user').pipe(
      tap((user) => {
        this.user.next(user);
      }),
      catchError((error) => {
        return throwError(error);
      })
    );
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.getRefreshToken().subscribe();
    }, expirationDuration * 1000 - 60 * 1000);
  }

  getRefreshToken() {
    return this.http
      .post<LoginResponse>(
        this.baseUrl + 'auth/refresh-token',
        {},
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap((loginResponse) => {
          this.handleAuthentication(loginResponse);
        }),
        catchError((error) => {
          this.logout();
          return throwError(error);
        })
      );
  }

  logout() {
    this.http
      .delete(this.baseUrl + 'auth/logout', { withCredentials: true })
      .subscribe();

    this.user.next(null);

    this.router.navigate(['/login']);
    localStorage.removeItem('userData');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.user.next(null);
  }

  autoLogin() {
    this.getRefreshToken().subscribe();
  }
}
