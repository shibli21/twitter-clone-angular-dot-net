import { AuthService } from './../../core/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { IUser } from 'src/app/core/models/user.model';
import { NewTweetService } from './../../core/services/new-tweet.service';

@Component({
  selector: 'app-new-tweet-dialog',
  templateUrl: './new-tweet-dialog.component.html',
  styleUrls: ['./new-tweet-dialog.component.scss'],
})
export class NewTweetDialogComponent implements OnInit {
  display = false;
  tweet: string = '';
  user$ = new Observable<IUser | null>();
  isLoading = false;
  tweetLimit = 280;

  private unsubscribe$: Subject<any> = new Subject<any>();

  constructor(
    private newTweetService: NewTweetService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.newTweetService.isTweetDialogOpenObservable
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((isOpen) => {
        this.display = isOpen;
      });
    this.user$ = this.authService.userObservable;

    this.newTweetService.isTweetingObservable
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((isTweeting) => {
        this.isLoading = isTweeting;
      });
  }

  onHide() {
    this.newTweetService.setTweetDialogDisplay(false);
  }

  onSubmit() {
    this.newTweetService.tweet(this.tweet);
    this.tweet = '';
  }

  get checkIsTweetValid() {
    return this.tweet.length > 0 && this.tweet.length <= this.tweetLimit;
  }

  get remainingCharacters() {
    return this.tweetLimit - this.tweet.length;
  }
}
