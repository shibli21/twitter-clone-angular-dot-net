import { ToastrService } from 'ngx-toastr';
import {
  IRegisterUser,
  ILoginUser,
  ILoginResponse,
} from './../models/user.model';
import { LiveNotificationService } from './live-notification.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { IUser } from '../models/user.model';

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
    private liveNotificationService: LiveNotificationService,
    private toastr: ToastrService
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

  userId() {
    return this.user.value?.id;
  }

  currentUserValue() {
    return this.user.value;
  }

  currentUser() {
    return this.http.get<IUser>(this.baseUrl + 'users/current-user').pipe(
      tap((user) => {
        this.user.next(user);
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }

  logout() {
    this.http
      .delete(this.baseUrl + 'auth/logout ', {
        withCredentials: true,
      })
      .subscribe({
        next: () => {
          this.liveNotificationService.stopConnection();
          this.user.next(null);
          localStorage.removeItem('userData');
          this.router.navigate(['/login']);
        },
        error: (err) => {},
      });
  }

  autoLogin() {
    const userAuthData = localStorage.getItem('userData');
    if (!userAuthData) {
      return;
    }
    const { jwtToken, refreshToken, ...user } = JSON.parse(
      userAuthData
    ) as ILoginResponse;

    this.user.next(user);

    this.liveNotificationService.startConnection(user.id).then(() => {
      this.liveNotificationService.addReceiveNotificationListener();
    });
  }

  sessionExpired() {
    this.liveNotificationService.stopConnection();
    this.user.next(null);
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  getJwtToken() {
    const userAuthData = localStorage.getItem('userData');
    if (!userAuthData) {
      return '';
    }
    const { jwtToken } = JSON.parse(userAuthData) as ILoginResponse;
    return jwtToken;
  }

  refreshToken() {
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

          this.liveNotificationService
            .startConnection(loginResponse.id)
            .then(() => {
              this.liveNotificationService.addReceiveNotificationListener();
            });
        }),
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }

  public setUser(user: IUser | null) {
    if (user) {
      this.user.next({
        ...this.user.value,
        ...user,
      });
    } else {
      this.user.next(null);
    }
  }
}
