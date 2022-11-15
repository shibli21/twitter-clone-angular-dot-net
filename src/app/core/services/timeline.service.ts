import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject, tap } from 'rxjs';

import { environment } from 'src/environments/environment';

import {
  IPaginatedTweets,
  PaginatedTweets,
  ITweet,
} from './../models/tweet.model';

@Injectable({
  providedIn: 'root',
})
export class TimelineService {
  private baseUrl = environment.baseUrl;

  private isLoadingNewsFeed = new BehaviorSubject<boolean>(false);
  private isLoadingUserTimeline = new BehaviorSubject<boolean>(false);
  private newsFeed = new BehaviorSubject<IPaginatedTweets>(
    new PaginatedTweets()
  );
  private userTimeline = new BehaviorSubject<IPaginatedTweets>(
    new PaginatedTweets()
  );

  newFeedObservable = this.newsFeed.asObservable();
  userTimelineObservable = this.userTimeline.asObservable();
  isLoadingUserTimelineObservable = this.isLoadingUserTimeline.asObservable();
  isLoadingNewsFeedObservable = this.isLoadingNewsFeed.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  getNewsFeed(page = 0, size = 20) {
    this.isLoadingNewsFeed.next(true);

    return this.http
      .get<IPaginatedTweets>(
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
      this.getNewsFeed(newsFeed.page + 1);
    }
  }

  getUserTimeline(userId: string, page = 0, size = 20) {
    this.isLoadingUserTimeline.next(true);
    return this.http
      .get<IPaginatedTweets>(
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
      .subscribe()
      .add(() => {
        this.isLoadingUserTimeline.next(false);
      });
  }

  loadMoreUserTimeline(userId: string) {
    const userTimeline = this.userTimeline.getValue();
    if (userTimeline && userTimeline.page < userTimeline.totalPages) {
      this.getUserTimeline(userId, userTimeline.page + 1);
    }
  }

  updateProfileTimeline(tweet: ITweet) {
    const userTimeline = this.userTimeline.getValue();
    if (userTimeline) {
      const index = userTimeline.tweets.findIndex((t) => t.id === tweet.id);
      if (index !== -1) {
        userTimeline.tweets[index] = tweet;
      }
      this.userTimeline.next(userTimeline);
    }
  }

  updateProfileTimelineAfterDelete(tweetId: string) {
    const userTimeline = this.userTimeline.getValue();
    if (userTimeline) {
      const index = userTimeline.tweets.findIndex((t) => t.id === tweetId);
      if (index !== -1) {
        userTimeline.tweets.splice(index, 1);
      }
      this.userTimeline.next(userTimeline);
    }
  }

  updateNewsFeed(tweet: ITweet) {
    const newsFeed = this.newsFeed.getValue();
    if (newsFeed) {
      const index = newsFeed.tweets.findIndex((t) => t.id === tweet.id);
      if (index !== -1) {
        newsFeed.tweets[index] = tweet;
      }
      this.newsFeed.next(newsFeed);
    }
  }

  updateNewsFeedRetweetCount(tweetId: string) {
    const newsFeed = this.newsFeed.getValue();
    if (newsFeed) {
      const index = newsFeed.tweets.findIndex((t) => t.id === tweetId);
      if (index !== -1) {
        newsFeed.tweets[index].retweetCount++;
      }
      this.newsFeed.next(newsFeed);
    }
  }

  updateUserTimelineRetweetCount(tweetId: string) {
    const userTimeline = this.userTimeline.getValue();
    if (userTimeline) {
      const index = userTimeline.tweets.findIndex((t) => t.id === tweetId);
      if (index !== -1) {
        userTimeline.tweets[index].retweetCount++;
      }
      this.userTimeline.next(userTimeline);
    }
  }

  public clearUserTimeLine() {
    this.userTimeline.next(new PaginatedTweets());
  }

  public clearNewsFeed() {
    this.newsFeed.next(new PaginatedTweets());
  }

  public setNewsFeed(newsFeed: IPaginatedTweets) {
    this.newsFeed.next(newsFeed);
  }

  public setUserTimeline(userTimeline: IPaginatedTweets) {
    this.userTimeline.next(userTimeline);
  }

  public addNewTweetToUserTimeline(tweet: ITweet) {
    const userTimeline = this.userTimeline.getValue();
    if (userTimeline) {
      userTimeline.tweets.unshift(tweet);
      this.userTimeline.next(userTimeline);
    }
  }

  get getNewsFeedValue() {
    return this.newsFeed.getValue();
  }
  get getUserTimelineValue() {
    return this.userTimeline.getValue();
  }
}
