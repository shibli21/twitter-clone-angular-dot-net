import { AuthService } from './../../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, tap, BehaviorSubject } from 'rxjs';
import { PaginatedUsers } from 'src/app/core/models/user.model';
import { environment } from './../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BlockService {
  baseUrl = environment.baseUrl;
  blockedUsers = new BehaviorSubject<PaginatedUsers>({
    users: [],
    lastPage: 0,
    page: 0,
    size: 0,
    totalElements: 0,
    totalPages: 0,
  });
  isLoadingBlockedUsers = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private authService: AuthService) {}

  blockUserByUser(userId: string) {
    return this.http.post(`${this.baseUrl}block/by-user/${userId}`, {}).pipe(
      tap(() => {
        this.authService.currentUser().subscribe((user) => {
          this.authService.user.next(user);
        });
      }),
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  getBlockedUsers(page = 0, size = 20) {
    this.isLoadingBlockedUsers.next(true);
    return this.http
      .get<PaginatedUsers>(
        `${this.baseUrl}block/by-user?size=${size}&page=${page}`
      )
      .pipe(
        tap((paginatedUsers) => {
          const blockedUsers = this.blockedUsers.getValue();
          if (blockedUsers) {
            paginatedUsers.users = [
              ...blockedUsers.users,
              ...paginatedUsers.users,
            ];
          }
          this.blockedUsers.next(paginatedUsers);
          this.isLoadingBlockedUsers.next(false);
        }),
        catchError((err) => {
          return throwError(err);
        })
      )
      .subscribe();
  }

  loadMoreBlockedUsers() {
    const blockedUser = this.blockedUsers.getValue();
    if (blockedUser && blockedUser.page < blockedUser.totalPages) {
      this.getBlockedUsers(blockedUser.page + 1, 20);
    }
  }
}
