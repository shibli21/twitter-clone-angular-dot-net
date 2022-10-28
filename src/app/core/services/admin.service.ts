import { ToastrModule, ToastrService } from 'ngx-toastr';
import { IDashboardData } from './../models/admin.model';
import { catchError, throwError } from 'rxjs';
import { IPaginatedUsers } from './../models/user.model';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient, private toastrService: ToastrService) {}

  getUsers(page = 0, size = 10) {
    return this.http
      .get<IPaginatedUsers>(`${this.baseUrl}users?page=${page}&size=${size} `)
      .pipe(
        catchError((err) => {
          return throwError(err);
        })
      );
  }

  getBlockedUsers(page = 0, size = 10) {
    return this.http
      .get<IPaginatedUsers>(
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

  getDashboardData() {
    return this.http.get<IDashboardData>(`${this.baseUrl}admin/dashboard`);
  }

  createAdmin(id: string) {
    return this.http.post(`${this.baseUrl}admin/create/${id}`, {}).pipe(
      catchError((err) => {
        return throwError(() => {
          this.toastrService.error(err.error.message);
        });
      })
    );
  }

  getAdmins(page = 0, size = 10) {
    return this.http
      .get<IPaginatedUsers>(`${this.baseUrl}admin?page=${page}&size=${size}`)
      .pipe(
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }
}
