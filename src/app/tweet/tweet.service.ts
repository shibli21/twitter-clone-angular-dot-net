import { catchError, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from './../../environments/environment';
import { Tweet } from './models/tweet.model';

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
}
