import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { PaginatedUsers } from 'src/app/auth/Models/user.model';
import { environment } from './../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BlockService {
  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient, private router: Router) {}

  blockUserByAdmin(id: string) {}

  blockUserByUser(userId: string) {
    return this.http.post(`${this.baseUrl}block/by-user/${userId}`, {}).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  getBlockedUsers(page = 0, size = 5) {
    return this.http
      .get<PaginatedUsers>(
        `${this.baseUrl}block/by-user?size=${size}&page=${page}`
      )
      .pipe(
        catchError((err) => {
          return throwError(err);
        })
      );
  }

  getPlatformBlockedUsers() {}
}
