import { catchError, throwError, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from './../../environments/environment';
import { Comment, Tweet } from './models/tweet.model';

@Injectable({
  providedIn: 'root',
})
export class TweetService {
  baseUrl = environment.baseUrl;

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
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  getUsersTweets(userId: string) {
    return this.http
      .get<Tweet[]>(this.baseUrl + 'tweet/user-tweets/' + userId)
      .pipe(
        catchError((err) => {
          return throwError(err);
        })
      );
  }

  getComments(tweetId: string) {
    return this.http
      .get<Comment[]>(this.baseUrl + 'tweet/comments/' + tweetId + '?size=220')
      .pipe(
        catchError((err) => {
          return throwError(err);
        })
      );
  }

  commentOnTweet(tweetId: string, comment: string) {
    return this.http
      .post<Comment>(this.baseUrl + 'tweet/comment/' + tweetId, { comment })
      .pipe(
        tap((comment) => {
          return comment;
        }),

        catchError((err) => {
          return throwError(err);
        })
      );
  }

  deleteComment(commentId: string) {
    return this.http.delete(this.baseUrl + 'tweet/comment/' + commentId).pipe(
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
}
