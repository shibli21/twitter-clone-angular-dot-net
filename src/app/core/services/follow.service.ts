import { PaginatedUsers } from '../../auth/Models/user.model';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FollowService {
  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient, private router: Router) {}

  followUnfollowUser(id: string) {
    return this.http.post(this.baseUrl + 'follow/' + id, {}).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  getFollowersByUserId(id: string, page = 0, size = 5) {
    return this.http
      .get<PaginatedUsers>(
        this.baseUrl + 'follow/followers/' + id + `?page=${page}&size=${size}`
      )
      .pipe(
        catchError((err) => {
          return throwError(err);
        })
      );
  }
  getFollowingsByUserId(id: string, page = 0, size = 5) {
    return this.http
      .get<PaginatedUsers>(
        this.baseUrl + 'follow/following/' + id + `?page=${page}&size=${size}`
      )
      .pipe(
        catchError((err) => {
          return throwError(err);
        })
      );
  }
}
