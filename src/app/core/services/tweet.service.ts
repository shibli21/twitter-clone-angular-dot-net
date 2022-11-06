import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ITweet } from '../models/tweet.model';

@Injectable({
  providedIn: 'root',
})
export class TweetService {
  private baseUrl = environment.baseUrl;
  private tweet = new BehaviorSubject<ITweet | null>(null);
  tweetObservable = this.tweet.asObservable();

  constructor(private http: HttpClient) {}

  createTweet(tweetText: string) {
    const hashTags = tweetText.match(/#\w+/g);

    return this.http
      .post<ITweet>(this.baseUrl + 'tweet/create', {
        tweet: tweetText,
        hashTags: hashTags ? hashTags : [],
      })
      .pipe(
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }

  getTweet(id: string) {
    return this.http.get<ITweet>(this.baseUrl + 'tweet/' + id).pipe(
      tap((tweet) => {
        this.tweet.next(tweet);
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }

  getUserTweets(userId: string) {
    return this.http
      .get<ITweet[]>(this.baseUrl + 'tweet/user-tweets/' + userId)
      .pipe(
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }

  likeTweet(tweetId: string) {
    return this.http.post(this.baseUrl + 'tweet/like/' + tweetId, {}).pipe(
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }

  editTweet(tweetId: string, tweetText: string) {
    const hashTags = tweetText.match(/#\w+/g);

    return this.http
      .put<ITweet>(this.baseUrl + 'tweet/' + tweetId, {
        tweet: tweetText,
        hashTags: hashTags ? hashTags : [],
      })
      .pipe(
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }

  deleteTweet(tweetId: string) {
    return this.http.delete(this.baseUrl + 'tweet/' + tweetId).pipe(
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }

  editRetweet(retweetId: string, tweetText: string) {
    const hashTags = tweetText.match(/#\w+/g);

    return this.http
      .put<ITweet>(this.baseUrl + 'tweet/retweet/' + retweetId, {
        tweet: tweetText,
        hashTags: hashTags ? hashTags : [],
      })
      .pipe(
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }

  updateTweet(tweet: ITweet) {
    this.tweet.next(tweet);
  }

  updateTweetRetweetCount() {
    const tweet = this.tweet.value;
    if (tweet) {
      tweet.retweetCount++;
      this.tweet.next(tweet);
    }
  }

  increaseCommentCount() {
    const tweet = this.tweet.value;
    if (tweet) {
      tweet.commentCount++;
      this.tweet.next(tweet);
    }
  }

  decreaseCommentCount() {
    const tweet = this.tweet.value;
    if (tweet) {
      tweet.commentCount--;
      this.tweet.next(tweet);
    }
  }

  get tweetValue() {
    return this.tweet.value;
  }
}
