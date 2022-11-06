import { HttpClient } from '@angular/common/http';
import { ITweet } from 'src/app/core/models/tweet.model';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, catchError, throwError } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NewTweetService {
  private baseUrl = environment.baseUrl;

  private isTweetDialogOpen = new BehaviorSubject<boolean>(false);
  private isTweeting = new BehaviorSubject<boolean>(false);

  isTweetDialogOpenObservable = this.isTweetDialogOpen.asObservable();
  isTweetingObservable = this.isTweeting.asObservable();

  constructor(private http: HttpClient) {}

  tweet(tweet: string) {
    this.isTweeting.next(true);

    const hashTags = tweet.match(/#\w+/g);

    return this.http
      .post<ITweet>(this.baseUrl + 'tweet/create', {
        tweet: tweet,
        hashTags: hashTags ? hashTags : [],
      })
      .pipe(
        catchError((err) => {
          return throwError(() => err);
        })
      )
      .subscribe(() => {
        this.isTweeting.next(false);
        this.isTweetDialogOpen.next(false);
      })
      .add(() => {
        this.isTweeting.next(false);
      });
  }

  toggleTweetDialog() {
    this.isTweetDialogOpen.next(!this.isTweetDialogOpen.value);
  }

  setTweetDialogDisplay(isOpen: boolean) {
    this.isTweetDialogOpen.next(isOpen);
  }
}
