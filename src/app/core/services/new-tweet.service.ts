import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { ITweet } from 'src/app/core/models/tweet.model';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { TimelineService } from './timeline.service';

@Injectable({
  providedIn: 'root',
})
export class NewTweetService {
  private baseUrl = environment.baseUrl;

  private isTweetDialogOpen = new BehaviorSubject<boolean>(false);
  private isTweeting = new BehaviorSubject<boolean>(false);

  isTweetDialogOpenObservable = this.isTweetDialogOpen.asObservable();
  isTweetingObservable = this.isTweeting.asObservable();

  constructor(
    private http: HttpClient,
    private timelineService: TimelineService,
    private toastrService: ToastrService,
    private authService: AuthService,
    private router: Router
  ) {}

  tweet(tweet: string) {
    this.isTweeting.next(true);

    const tweetTextWithOutHtmlTag = tweet.replace(/(<([^>]+)>)/gi, '');
    const hashTags = tweetTextWithOutHtmlTag.match(/#\w+/g);

    return this.http
      .post<ITweet>(this.baseUrl + 'tweet/create', {
        tweet: tweet,
        hashTags: hashTags ? hashTags : [],
      })
      .pipe(
        tap((tweet) => {
          if (this.router.url.includes(this.authService.userId()!)) {
            this.timelineService.addNewTweetToUserTimeline(tweet);
          }
        }),
        catchError((err) => {
          return throwError(() => err);
        })
      )
      .subscribe(() => {
        this.isTweeting.next(false);
        this.isTweetDialogOpen.next(false);
        this.toastrService.success('Tweeted successfully');
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
