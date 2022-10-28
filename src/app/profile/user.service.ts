import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import { User } from '../core/models/user.model';
import { environment } from './../../environments/environment';
import { FollowService } from './../core/services/follow.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  baseUrl = environment.baseUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    private followService: FollowService
  ) {}

  getUserById(id: string) {
    return this.http.get<User>(this.baseUrl + 'users/' + id).pipe(
      tap(() => {
        this.followService.userFollowers.next({
          lastPage: 0,
          page: 0,
          size: 0,
          totalElements: 0,
          totalPages: 0,
          users: [],
        });
        this.followService.userFollowings.next({
          lastPage: 0,
          page: 0,
          size: 0,
          totalElements: 0,
          totalPages: 0,
          users: [],
        });
      }),

      catchError((err) => {
        return throwError(err);
      })
    );
  }

  updateUser(user: User) {
    return this.http.put<User>(this.baseUrl + 'users/edit', user).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  getYouMayFollow() {
    return this.http
      .get<User[]>(this.baseUrl + 'users/may-follow' + `?size=${8}`)
      .pipe(
        catchError((err) => {
          return throwError(err);
        })
      );
  }
}
