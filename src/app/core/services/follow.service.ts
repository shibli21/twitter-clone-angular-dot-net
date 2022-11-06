import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IPaginatedUsers, PaginatedUsers } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class FollowService {
  baseUrl = environment.baseUrl;

  private followers = new BehaviorSubject<IPaginatedUsers | null>(
    new PaginatedUsers()
  );
  followersObservable = this.followers.asObservable();
  private isLoadingFollowers = new BehaviorSubject<boolean>(false);
  isLoadingFollowersObservable = this.isLoadingFollowers.asObservable();

  private following = new BehaviorSubject<IPaginatedUsers | null>(
    new PaginatedUsers()
  );
  followingObservable = this.following.asObservable();
  private isLoadingFollowing = new BehaviorSubject<boolean>(false);
  isLoadingFollowingObservable = this.isLoadingFollowing.asObservable();

  constructor(private http: HttpClient) {}

  followUnfollowUser(id: string) {
    return this.http.post(this.baseUrl + 'follow/' + id, {}).pipe(
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }

  getFollowersByUserId(id: string, page = 0, size = 20) {
    this.isLoadingFollowers.next(true);
    return this.http
      .get<IPaginatedUsers>(
        `${this.baseUrl}follow/followers/${id}?page=${page}&size=${size}`
      )
      .pipe(
        tap((users) => {
          const userFollowers = this.followers.getValue();
          if (userFollowers) {
            users.users = [...userFollowers.users, ...users.users];
          }
          this.followers.next(users);
          this.isLoadingFollowers.next(false);
        })
      )
      .subscribe();
  }

  loadMoreFollowers(id: string) {
    const followers = this.followers.getValue();
    if (followers && followers.page < followers.totalPages) {
      this.getFollowersByUserId(id, followers.page + 1);
    }
  }

  getFollowingByUserId(id: string, page = 0, size = 20) {
    this.isLoadingFollowing.next(true);
    return this.http
      .get<IPaginatedUsers>(
        `${this.baseUrl}follow/following/${id}?page=${page}&size=${size}`
      )
      .pipe(
        tap((users) => {
          const following = this.following.getValue();
          if (following) {
            users.users = [...following.users, ...users.users];
          }
          this.following.next(users);
          this.isLoadingFollowing.next(false);
        })
      )
      .subscribe();
  }

  loadMoreFollowing(id: string) {
    const userFollowings = this.following.getValue();
    if (userFollowings && userFollowings.page < userFollowings.totalPages) {
      this.getFollowingByUserId(id, userFollowings.page + 1);
    }
  }

  clearFollowersAndFollowing() {
    this.followers.next(new PaginatedUsers());
    this.following.next(new PaginatedUsers());
  }
}
