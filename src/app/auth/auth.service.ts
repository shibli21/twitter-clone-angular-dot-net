import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { LiveNotificationService } from './../core/services/live-notification.service';

import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';

import {
  ILoginResponse,
  ILoginUser,
  IRegisterUser,
  IUser,
} from '../core/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = environment.baseUrl;
  private user = new BehaviorSubject<IUser | null>(null);
  private isLoggingInLoading = new BehaviorSubject<boolean>(false);

  userObservable = this.user.asObservable();
  isLoggingInLoadingObservable = this.isLoggingInLoading.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private liveNotificationService: LiveNotificationService
  ) {}

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
      .post<ILoginResponse>(this.baseUrl + 'auth/login', loginUser, {
        withCredentials: true,
      })
      .pipe(
        tap((loginResponse) => {
          localStorage.setItem('userData', JSON.stringify(loginResponse));
          if (loginResponse.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }

          this.user.next(loginResponse);

          this.isLoggingInLoading.next(false);

          this.liveNotificationService
            .startConnection(loginResponse.id)
            .then(() => {
              this.liveNotificationService.addReceiveNotificationListener();
            });
        }),
        catchError((err) => {
          return throwError(() => err);
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
    if (!this.user.value) {
      return false;
    }

    return this.user.value.role === 'admin';
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
    const { jwtToken } = JSON.parse(userAuthData) as ILoginResponse;
    return jwtToken;
  }

  currentUser() {
    return this.http.get<IUser>(this.baseUrl + 'users/current-user').pipe(
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
      .post<ILoginResponse>(
        this.baseUrl + 'auth/refresh-token',
        {},
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap((loginResponse) => {
          localStorage.setItem('userData', JSON.stringify(loginResponse));
          this.user.next(loginResponse);
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
      .subscribe({
        next: () => {
          this.liveNotificationService.stopConnection();
          localStorage.clear();
          this.user.next(null);
        },
      })
      .add(() => {
        this.router.navigate(['/login']);
      });
  }

  autoLogin() {
    const userAuthData = localStorage.getItem('userData');

    if (userAuthData) {
      const { id } = JSON.parse(userAuthData) as ILoginResponse;

      this.liveNotificationService.startConnection(id).then(() => {
        this.liveNotificationService.addReceiveNotificationListener();
      });

      return this.getRefreshToken().subscribe();
    }

    return;
  }

  public setUser(user: IUser) {
    this.user.next({
      ...this.user.value,
      ...user,
    });
  }
}
