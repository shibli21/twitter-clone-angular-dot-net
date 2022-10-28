import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import {
  IPaginatedUsers,
  PaginatedUsers,
} from 'src/app/core/models/user.model';
import { environment } from './../../../environments/environment';
import { FollowService } from './follow.service';

@Injectable({
  providedIn: 'root',
})
export class BlockService {
  baseUrl = environment.baseUrl;
  blockedUsers = new BehaviorSubject<IPaginatedUsers>(new PaginatedUsers());
  isLoadingBlockedUsers = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private followService: FollowService) {}

  blockUserByUser(userId: string) {
    return this.http.post(`${this.baseUrl}block/by-user/${userId}`, {}).pipe(
      tap(() => {
        this.followService.myFollowers.next(new PaginatedUsers());
        this.followService.getMyFollowers();

        this.followService.myFollowings.next(new PaginatedUsers());
        this.followService.getMyFollowings();
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }

  getBlockedUsers(page = 0, size = 20) {
    this.isLoadingBlockedUsers.next(true);
    return this.http
      .get<IPaginatedUsers>(
        `${this.baseUrl}block/by-user?size=${size}&page=${page}`
      )
      .pipe(
        tap((IPaginatedUsers) => {
          const blockedUsers = this.blockedUsers.getValue();
          if (blockedUsers) {
            IPaginatedUsers.users = [
              ...blockedUsers.users,
              ...IPaginatedUsers.users,
            ];
          }
          this.blockedUsers.next(IPaginatedUsers);
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
