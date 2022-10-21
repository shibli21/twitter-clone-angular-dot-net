import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject, tap } from 'rxjs';

import { environment } from 'src/environments/environment';

import { PaginatedTweets } from './../models/tweet.model';

@Injectable({
  providedIn: 'root',
})
export class TimelineService {
  baseUrl = environment.baseUrl;
  isLoadingNewsFeed = new BehaviorSubject<boolean>(false);
  isLoadingUserTimeline = new BehaviorSubject<boolean>(false);
  newsFeed = new BehaviorSubject<PaginatedTweets>({
    tweets: [],
    page: 0,
    totalPages: 0,
    totalElements: 0,
    lastPage: 0,
    size: 0,
  });

  userTimeline = new BehaviorSubject<PaginatedTweets>({
    tweets: [],
    page: 0,
    totalPages: 0,
    totalElements: 0,
    lastPage: 0,
    size: 0,
  });

  constructor(private http: HttpClient, private router: Router) {}

  getNewsFeed(page = 0, size = 5) {
    this.isLoadingNewsFeed.next(true);

    return this.http
      .get<PaginatedTweets>(
        `${this.baseUrl}news-feed?page=${page}&size=${size}`
      )
      .pipe(
        tap((paginatedTweets) => {
          const newsFeed = this.newsFeed.getValue();
          if (newsFeed) {
            paginatedTweets.tweets = [
              ...newsFeed.tweets,
              ...paginatedTweets.tweets,
            ];
          }
          this.newsFeed.next(paginatedTweets);
          this.isLoadingNewsFeed.next(false);
        })
      )
      .subscribe();
  }

  loadMoreNewsFeed() {
    const newsFeed = this.newsFeed.getValue();
    if (newsFeed && newsFeed.page < newsFeed.totalPages) {
      this.getNewsFeed(newsFeed.page + 1, 2);
    }
  }

  getUserTimeline(userId: string, page = 0, size = 5) {
    this.isLoadingUserTimeline.next(true);
    return this.http
      .get<PaginatedTweets>(
        `${this.baseUrl}user-timeline/${userId}?page=${page}&size=${size}`
      )
      .pipe(
        tap((paginatedTweets) => {
          const userTimeline = this.userTimeline.getValue();
          if (userTimeline) {
            paginatedTweets.tweets = [
              ...userTimeline.tweets,
              ...paginatedTweets.tweets,
            ];
          }
          this.userTimeline.next(paginatedTweets);
          this.isLoadingUserTimeline.next(false);
        })
      )
      .subscribe();
  }

  loadMoreUserTimeline(userId: string) {
    const userTimeline = this.userTimeline.getValue();
    if (userTimeline && userTimeline.page < userTimeline.totalPages) {
      this.getUserTimeline(userId, userTimeline.page + 1, 2);
    }
  }
}
