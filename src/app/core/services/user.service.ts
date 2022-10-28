import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import { PaginatedUsers, IUser } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { FollowService } from './follow.service';

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
    return this.http.get<IUser>(this.baseUrl + 'users/' + id).pipe(
      tap(() => {
        this.followService.userFollowers.next(new PaginatedUsers());
        this.followService.userFollowings.next(new PaginatedUsers());
      }),

      catchError((err) => {
        return throwError(err);
      })
    );
  }

  updateUser(user: IUser) {
    return this.http.put<IUser>(this.baseUrl + 'users/edit', user).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  getYouMayFollow() {
    return this.http
      .get<IUser[]>(this.baseUrl + 'users/may-follow' + `?size=${8}`)
      .pipe(
        catchError((err) => {
          return throwError(err);
        })
      );
  }
}
