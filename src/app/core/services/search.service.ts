import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { PaginatedUsers } from 'src/app/core/models/user.model';
import { environment } from 'src/environments/environment';
import { PaginatedTweets } from './../models/tweet.model';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  baseUrl = environment.baseUrl;
  isSearchingUsers = new BehaviorSubject<boolean>(false);
  isSearchingTweets = new BehaviorSubject<boolean>(false);
  searchedUsers = new BehaviorSubject<PaginatedUsers>({
    users: [],
    lastPage: 0,
    page: 0,
    size: 0,
    totalElements: 0,
    totalPages: 0,
  });
  searchedTweets = new BehaviorSubject<PaginatedTweets>({
    tweets: [],
    lastPage: 0,
    page: 0,
    size: 0,
    totalElements: 0,
    totalPages: 0,
  });
  searchQuery = new BehaviorSubject<string>('');
  tweetSearchQuery = new BehaviorSubject<string>('');

  constructor(private http: HttpClient) {}

  getSearchUsers = (page = 0, size = 20) => {
    this.isSearchingUsers.next(true);

    if (this.searchQuery.value === '') {
      this.isSearchingUsers.next(false);
      return;
    }

    return this.http
      .get<PaginatedUsers>(
        `${this.baseUrl}search/search-users?searchQuery=${this.searchQuery.value}&page=${page}&limit=${size}`
      )
      .pipe(
        tap((paginatedUsers) => {
          const searchedUsers = this.searchedUsers.getValue();
          if (searchedUsers) {
            paginatedUsers.users = [
              ...searchedUsers.users,
              ...paginatedUsers.users,
            ];
          }
          this.searchedUsers.next(paginatedUsers);
          this.isSearchingUsers.next(false);
        })
      )
      .subscribe();
  };

  loadMoreSearchedUsers() {
    const users = this.searchedUsers.getValue();
    if (users && users.page < users.totalPages) {
      this.getSearchUsers(users.page + 1);
    }
  }
  getSearchTweets = (page = 0, size = 20) => {
    //remove # from search query
    const searchQueryWithOutHash = this.tweetSearchQuery.value.replace('#', '');

    this.isSearchingTweets.next(true);

    if (searchQueryWithOutHash === '') {
      this.isSearchingUsers.next(false);
      return;
    }

    return this.http
      .get<PaginatedTweets>(
        `${this.baseUrl}search/search-tweets?searchQuery=${searchQueryWithOutHash}&page=${page}&limit=${size}`
      )
      .pipe(
        tap((paginatedTweets) => {
          const searchedTweets = this.searchedTweets.getValue();
          if (searchedTweets) {
            paginatedTweets.tweets = [
              ...searchedTweets.tweets,
              ...paginatedTweets.tweets,
            ];
          }
          this.searchedTweets.next(paginatedTweets);
          this.isSearchingTweets.next(false);
        })
      )
      .subscribe({
        error: (err) => {
          this.isSearchingTweets.next(false);
        },
      });
  };

  loadMoreSearchedTweets() {
    const users = this.searchedTweets.getValue();
    if (users && users.page < users.totalPages) {
      this.getSearchTweets(users.page + 1);
    }
  }
}
