import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedUsers } from '../models/user.model';
import { AuthService } from './../../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class FollowService {
  baseUrl = environment.baseUrl;
  myFollowers = new BehaviorSubject<PaginatedUsers>({
    lastPage: 0,
    page: 0,
    size: 0,
    totalElements: 0,
    totalPages: 0,
    users: [],
  });
  isLoadingMyFollowers = new BehaviorSubject<boolean>(false);
  myFollowings = new BehaviorSubject<PaginatedUsers>({
    lastPage: 0,
    page: 0,
    size: 0,
    totalElements: 0,
    totalPages: 0,
    users: [],
  });
  isLoadingMyFollowings = new BehaviorSubject<boolean>(false);
  userFollowings = new BehaviorSubject<PaginatedUsers>({
    lastPage: 0,
    page: 0,
    size: 0,
    totalElements: 0,
    totalPages: 0,
    users: [],
  });
  isLoadingUserFollowings = new BehaviorSubject<boolean>(false);
  userFollowers = new BehaviorSubject<PaginatedUsers>({
    lastPage: 0,
    page: 0,
    size: 0,
    totalElements: 0,
    totalPages: 0,
    users: [],
  });
  isLoadingUserFollowers = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private authService: AuthService) {}

  followUnfollowUser(id: string) {
    return this.http.post(this.baseUrl + 'follow/' + id, {}).pipe(
      tap(() => {
        this.myFollowers.next({
          lastPage: 0,
          page: 0,
          size: 0,
          totalElements: 0,
          totalPages: 0,
          users: [],
        });
        this.getMyFollowers();
        this.myFollowings.next({
          lastPage: 0,
          page: 0,
          size: 0,
          totalElements: 0,
          totalPages: 0,
          users: [],
        });
        this.getMyFollowings();
      }),
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  getFollowersByUserId(id: string, page = 0, size = 10) {
    this.isLoadingUserFollowers.next(true);
    return this.http
      .get<PaginatedUsers>(
        `${this.baseUrl}follow/followers/${id}?page=${page}&size=${size}`
      )
      .pipe(
        tap((paginatedUsers) => {
          const userFollowers = this.userFollowers.getValue();
          if (userFollowers) {
            paginatedUsers.users = [
              ...userFollowers.users,
              ...paginatedUsers.users,
            ];
          }
          this.userFollowers.next(paginatedUsers);
          this.isLoadingUserFollowers.next(false);
        })
      )
      .subscribe();
  }

  loadMoreUsersFollowers(userId: string) {
    const userFollowings = this.userFollowings.getValue();
    if (userFollowings && userFollowings.page < userFollowings.totalPages) {
      this.getFollowersByUserId(userId, userFollowings.page + 1);
    }
  }

  getFollowingsByUserId(id: string, page = 0, size = 10) {
    this.isLoadingUserFollowings.next(true);
    return this.http
      .get<PaginatedUsers>(
        `${this.baseUrl}follow/following/${id}?page=${page}&size=${size}`
      )
      .pipe(
        tap((paginatedUsers) => {
          const userFollowings = this.userFollowings.getValue();
          if (userFollowings) {
            paginatedUsers.users = [
              ...userFollowings.users,
              ...paginatedUsers.users,
            ];
          }
          this.userFollowings.next(paginatedUsers);
          this.isLoadingUserFollowings.next(false);
        })
      )
      .subscribe();
  }

  loadMoreUsersFollowings(userId: string) {
    const userFollowings = this.userFollowings.getValue();
    if (userFollowings && userFollowings.page < userFollowings.totalPages) {
      this.getFollowingsByUserId(userId, userFollowings.page + 1);
    }
  }

  getMyFollowers(page = 0, size = 10) {
    this.isLoadingMyFollowers.next(true);
    return this.http
      .get<PaginatedUsers>(
        `${
          this.baseUrl
        }follow/followers/${this.authService.userId()}?page=${page}&size=${size}`
      )
      .pipe(
        tap((paginatedUsers) => {
          const myFollowers = this.myFollowers.getValue();
          if (myFollowers) {
            paginatedUsers.users = [
              ...myFollowers.users,
              ...paginatedUsers.users,
            ];
          }
          this.myFollowers.next(paginatedUsers);
          this.isLoadingMyFollowers.next(false);
        })
      )
      .subscribe();
  }

  loadMoreMyFollowers() {
    const myFollowers = this.myFollowers.getValue();
    if (myFollowers && myFollowers.page < myFollowers.totalPages) {
      this.getMyFollowers(myFollowers.page + 1);
    }
  }

  getMyFollowings(page = 0, size = 10) {
    this.isLoadingMyFollowings.next(true);
    return this.http
      .get<PaginatedUsers>(
        `${
          this.baseUrl
        }follow/following/${this.authService.userId()}?page=${page}&size=${size}`
      )
      .pipe(
        tap((paginatedUsers) => {
          const myFollowings = this.myFollowings.getValue();
          if (myFollowings) {
            paginatedUsers.users = [
              ...myFollowings.users,
              ...paginatedUsers.users,
            ];
          }
          this.myFollowings.next(paginatedUsers);
          this.isLoadingMyFollowings.next(false);
        })
      )
      .subscribe();
  }

  loadMoreMyFollowings() {
    const myFollowings = this.myFollowings.getValue();
    if (myFollowings && myFollowings.page < myFollowings.totalPages) {
      this.getMyFollowings(myFollowings.page + 1);
    }
  }
}
