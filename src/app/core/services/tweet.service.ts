import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { Tweet } from '../models/tweet.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TweetService {
  baseUrl = environment.baseUrl;
  tweet = new BehaviorSubject<Tweet | null>(null);

  constructor(private http: HttpClient, private router: Router) {}

  createTweet(tweetText: string) {
    const hashTags = tweetText.match(/#\w+/g);

    return this.http
      .post<Tweet>(this.baseUrl + 'tweet/create', {
        tweet: tweetText,
        hashTags: hashTags ? hashTags : [],
      })
      .pipe(
        catchError((err) => {
          return throwError(err);
        })
      );
  }

  getTweet(id: string) {
    return this.http.get<Tweet>(this.baseUrl + 'tweet/' + id).pipe(
      tap((tweet) => {
        this.tweet.next(tweet);
      }),
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  getUserTweets(userId: string) {
    return this.http
      .get<Tweet[]>(this.baseUrl + 'tweet/user-tweets/' + userId)
      .pipe(
        catchError((err) => {
          return throwError(err);
        })
      );
  }

  likeTweet(tweetId: string) {
    return this.http.post(this.baseUrl + 'tweet/like/' + tweetId, {}).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  editTweet(tweetId: string, tweetText: string) {
    const hashTags = tweetText.match(/#\w+/g);

    return this.http
      .put<Tweet>(this.baseUrl + 'tweet/' + tweetId, {
        tweet: tweetText,
        hashTags: hashTags ? hashTags : [],
      })
      .pipe(
        catchError((err) => {
          return throwError(err);
        })
      );
  }

  deleteTweet(tweetId: string) {
    return this.http.delete(this.baseUrl + 'tweet/' + tweetId).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  editRetweet(retweetId: string, tweetText: string) {
    const hashTags = tweetText.match(/#\w+/g);

    return this.http
      .put<Tweet>(this.baseUrl + 'tweet/retweet/' + retweetId, {
        tweet: tweetText,
        hashTags: hashTags ? hashTags : [],
      })
      .pipe(
        catchError((err) => {
          return throwError(err);
        })
      );
  }
}
