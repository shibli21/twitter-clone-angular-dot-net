import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IPaginatedUsers, PaginatedUsers } from '../models/user.model';
import { AuthService } from './../../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class FollowService {
  baseUrl = environment.baseUrl;

  myFollowers = new BehaviorSubject<IPaginatedUsers>(new PaginatedUsers());
  isLoadingMyFollowers = new BehaviorSubject<boolean>(false);

  myFollowings = new BehaviorSubject<IPaginatedUsers>(new PaginatedUsers());
  isLoadingMyFollowings = new BehaviorSubject<boolean>(false);

  userFollowings = new BehaviorSubject<IPaginatedUsers>(new PaginatedUsers());
  isLoadingUserFollowings = new BehaviorSubject<boolean>(false);

  userFollowers = new BehaviorSubject<IPaginatedUsers>(new PaginatedUsers());
  isLoadingUserFollowers = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private authService: AuthService) {}

  followUnfollowUser(id: string) {
    return this.http.post(this.baseUrl + 'follow/' + id, {}).pipe(
      tap(() => {
        this.myFollowers.next(new PaginatedUsers());
        this.getMyFollowers();

        this.myFollowings.next(new PaginatedUsers());
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
      .get<IPaginatedUsers>(
        `${this.baseUrl}follow/followers/${id}?page=${page}&size=${size}`
      )
      .pipe(
        tap((IPaginatedUsers) => {
          const userFollowers = this.userFollowers.getValue();
          if (userFollowers) {
            IPaginatedUsers.users = [
              ...userFollowers.users,
              ...IPaginatedUsers.users,
            ];
          }
          this.userFollowers.next(IPaginatedUsers);
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
      .get<IPaginatedUsers>(
        `${this.baseUrl}follow/following/${id}?page=${page}&size=${size}`
      )
      .pipe(
        tap((IPaginatedUsers) => {
          const userFollowings = this.userFollowings.getValue();
          if (userFollowings) {
            IPaginatedUsers.users = [
              ...userFollowings.users,
              ...IPaginatedUsers.users,
            ];
          }
          this.userFollowings.next(IPaginatedUsers);
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
      .get<IPaginatedUsers>(
        `${
          this.baseUrl
        }follow/followers/${this.authService.userId()}?page=${page}&size=${size}`
      )
      .pipe(
        tap((IPaginatedUsers) => {
          const myFollowers = this.myFollowers.getValue();
          if (myFollowers) {
            IPaginatedUsers.users = [
              ...myFollowers.users,
              ...IPaginatedUsers.users,
            ];
          }
          this.myFollowers.next(IPaginatedUsers);
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
      .get<IPaginatedUsers>(
        `${
          this.baseUrl
        }follow/following/${this.authService.userId()}?page=${page}&size=${size}`
      )
      .pipe(
        tap((IPaginatedUsers) => {
          const myFollowings = this.myFollowings.getValue();
          if (myFollowings) {
            IPaginatedUsers.users = [
              ...myFollowings.users,
              ...IPaginatedUsers.users,
            ];
          }
          this.myFollowings.next(IPaginatedUsers);
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
