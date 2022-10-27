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
  baseUrl = environment.baseUrl;
  user = new BehaviorSubject<User | null>(null);
  isLoggingInLoading = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {}

  registerUser(registerUser: IRegisterUser) {
    return this.http.post(this.baseUrl + 'auth/register', registerUser).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  loginUser(loginUser: ILoginUser) {
    this.isLoggingInLoading.next(true);
    return this.http
      .post<LoginResponse>(this.baseUrl + 'auth/login', loginUser, {
        withCredentials: true,
      })
      .pipe(
        tap((loginResponse) => {
          localStorage.setItem('userData', JSON.stringify(loginResponse));
          this.currentUser().subscribe({
            next: (user) => {
              if (user.role === 'admin') {
                this.router.navigate(['/admin']);
              } else {
                this.router.navigate(['/']);
              }
              this.isLoggingInLoading.next(false);
            },
            error: (err) => {
              this.isLoggingInLoading.next(false);
              this.logout();
            },
          });
        }),
        catchError((err) => {
          return throwError(err);
        })
      );
  }

  isAuthenticated() {
    const userAuthData = localStorage.getItem('userData');
    if (!userAuthData) {
      return false;
    }
    return true;
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

  jwtToken() {
    const userAuthData = localStorage.getItem('userData');
    if (!userAuthData) {
      return '';
    }
    const { jwtToken } = JSON.parse(userAuthData) as LoginResponse;
    return jwtToken;
  }

  currentUser() {
    return this.http.get<User>(this.baseUrl + 'users/current-user').pipe(
      tap((user) => {
        this.user.next(user);
      }),
      catchError((err) => {
        this.getRefreshToken().subscribe();
        return throwError(() => err);
      })
    );
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
          localStorage.setItem('userData', JSON.stringify(loginResponse));
          this.currentUser().subscribe();
        }),
        catchError((error) => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  logout() {
    this.http
      .delete(this.baseUrl + 'auth/logout', { withCredentials: true })
      .subscribe();

    this.user.next(null);
    localStorage.clear();
    this.deleteAllCookies();
    this.router.navigate(['/login']);
  }

  autoLogin() {
    const userAuthData = localStorage.getItem('userData');

    if (!userAuthData) {
      return this.getRefreshToken().subscribe();
    }

    return this.currentUser().subscribe();
  }

  private deleteAllCookies() {
    var cookies = document.cookie.split(';');

    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];
      var eqPos = cookie.indexOf('=');
      var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }
}
