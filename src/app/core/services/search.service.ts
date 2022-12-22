import { Router } from '@angular/router';
import { PaginatedUsers } from './../models/user.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { IPaginatedUsers } from 'src/app/core/models/user.model';
import { environment } from 'src/environments/environment';
import { IPaginatedTweets, PaginatedTweets } from './../models/tweet.model';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private baseUrl = environment.baseUrl;

  private isSearchingUsers = new BehaviorSubject<boolean>(false);
  private isSearchingTweets = new BehaviorSubject<boolean>(false);
  private searchedUsers = new BehaviorSubject<IPaginatedUsers>(
    new PaginatedUsers()
  );
  private searchedTweets = new BehaviorSubject<IPaginatedTweets>(
    new PaginatedTweets()
  );
  private searchQuery = new BehaviorSubject<string>('');
  private tweetSearchQuery = new BehaviorSubject<string>('');
  private isSearchDialogOpen = new BehaviorSubject<boolean>(false);

  isSearchingUsersObservable = this.isSearchingUsers.asObservable();
  isSearchingTweetsObservable = this.isSearchingTweets.asObservable();

  isSearchDialogOpenObservable = this.isSearchDialogOpen.asObservable();
  searchedUsersObservable = this.searchedUsers.asObservable();
  searchedTweetsObservable = this.searchedTweets.asObservable();
  searchQueryObservable = this.searchQuery.asObservable();
  tweetSearchQueryObservable = this.tweetSearchQuery.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  getSearchUsers = (page = 0, size = 20) => {
    this.isSearchingUsers.next(true);

    if (this.searchQuery.value === '') {
      this.isSearchingUsers.next(false);
      return;
    }

    return this.http
      .get<IPaginatedUsers>(
        `${this.baseUrl}search/search-users?searchQuery=${this.searchQuery.value}&page=${page}&limit=${size}`
      )
      .pipe(
        tap((IPaginatedUsers) => {
          const searchedUsers = this.searchedUsers.getValue();
          if (searchedUsers) {
            IPaginatedUsers.users = [
              ...searchedUsers.users,
              ...IPaginatedUsers.users,
            ];
          }
          this.searchedUsers.next(IPaginatedUsers);
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
      .get<IPaginatedTweets>(
        `${this.baseUrl}search/search-tweets?searchQuery=${searchQueryWithOutHash}&page=${page}&limit=${size}`
      )
      .pipe(
        tap((IPaginatedTweets) => {
          const searchedTweets = this.searchedTweets.getValue();
          if (searchedTweets) {
            IPaginatedTweets.tweets = [
              ...searchedTweets.tweets,
              ...IPaginatedTweets.tweets,
            ];
          }
          this.searchedTweets.next(IPaginatedTweets);
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

  toggleSearchDialog() {
    this.isSearchDialogOpen.next(!this.isSearchDialogOpen.value);
  }

  onSearch(query: string) {
    this.isSearchDialogOpen.next(false);

    if (query.startsWith('#')) {
      this.searchedTweets.next(new PaginatedTweets());
      this.tweetSearchQuery.next(query);

      if (this.router.url !== '/search/search-tweets') {
        this.router.navigate(['/search/search-tweets']);
      }

      this.getSearchTweets();
    } else {
      this.searchedUsers.next(new PaginatedUsers());
      this.searchQuery.next(query);

      if (this.router.url !== '/search/search-users') {
        this.router.navigate(['/search/search-users']);
      }

      this.getSearchUsers();
    }
  }

  setIsSearchDialogOpen(isOpen: boolean) {
    this.isSearchDialogOpen.next(isOpen);
  }

  searchResultForAutoComplete(query: string) {
    return this.http.get<IPaginatedUsers>(
      `${this.baseUrl}search/search-users?searchQuery=${query}&page=0&limit=10`
    );
  }
}
