import { catchError, throwError } from 'rxjs';
import { PaginatedUsers } from './../models/user.model';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getUsers(page = 0, size = 10) {
    return this.http
      .get<PaginatedUsers>(`${this.baseUrl}users?page=${page}&size=${size} `)
      .pipe(
        catchError((err) => {
          return throwError(err);
        })
      );
  }

  getBlockedUsers(page = 0, size = 10) {
    return this.http
      .get<PaginatedUsers>(
        `${this.baseUrl}block/by-admin?page=${page}&size=${size} `
      )
      .pipe(
        catchError((err) => {
          return throwError(err);
        })
      );
  }

  blockUser(id: string) {
    return this.http.post(`${this.baseUrl}block/by-admin/${id}`, {});
  }
}
