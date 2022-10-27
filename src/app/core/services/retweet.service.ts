import { catchError, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from 'src/environments/environment';
import { Tweet } from '../models/tweet.model';

@Injectable({
  providedIn: 'root',
})
export class RetweetService {
  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient, private router: Router) {}

  retweet(id: string, tweet?: string) {
    let hashTags: string[] | null = [];
    if (tweet) {
      hashTags = tweet.match(/#\w+/g);
    }

    return this.http
      .post<Tweet>(`${this.baseUrl}tweet/retweet/${id}`, {
        tweet,
        hashTags: hashTags ? hashTags : [],
      })
      .pipe(
        catchError((err) => {
          return throwError(err);
        })
      );
  }
}
