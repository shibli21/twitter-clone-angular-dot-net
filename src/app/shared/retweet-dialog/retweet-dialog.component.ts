import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ITweet } from './../../core/models/tweet.model';
import { IUser } from './../../core/models/user.model';
import { RetweetService } from './../../core/services/retweet.service';
import { TimelineService } from './../../core/services/timeline.service';
import { TweetService } from './../../core/services/tweet.service';

@Component({
  selector: 'app-retweet-dialog',
  templateUrl: './retweet-dialog.component.html',
  styleUrls: ['./retweet-dialog.component.scss'],
})
export class RetweetDialogComponent implements OnInit {
  @Input() visible = false;
  @Input() currentUser!: IUser;
  @Input() tweet!: ITweet;
  @Output() onCloseEvent = new EventEmitter();

  retweetText: string | undefined = '';
  isRetweeting = false;
  retweetLimit = 280;

  constructor(
    private router: Router,
    private retweetService: RetweetService,
    private toastr: ToastrService,
    private timelineService: TimelineService,
    private tweetService: TweetService
  ) {}

  ngOnInit(): void {}

  isTweetNull() {
    return this.tweet.tweet.length === 0;
  }

  retweet() {
    if (this.checkIsTweetValid) {
      return;
    }
    this.isRetweeting = true;
    let retweetId = this.tweet.id;

    if (this.tweet.tweet === '' && this.tweet.refTweet) {
      retweetId = this.tweet.refTweet.id;
    }

    this.retweetService.retweet(retweetId, this.retweetText).subscribe({
      next: (res) => {
        this.visible = false;
        this.toastr.success('Retweeted successfully');
        this.isRetweeting = false;
        if (this.router.url === '/home') {
          this.timelineService.updateNewsFeedRetweetCount(this.tweet.id);
          console.log('update news feed');
        } else if (this.router.url.startsWith('/profile')) {
          this.timelineService.updateUserTimelineRetweetCount(this.tweet.id);
        } else {
          this.tweetService.updateTweetRetweetCount();
        }
      },
      error: (err) => {
        this.toastr.error(err.error.message);
        this.isRetweeting = false;
      },
    });
    this.retweetText = '';
  }

  onHide() {
    this.retweetText = '';
    this.onCloseEvent.emit();
  }

  get checkIsTweetValid() {
    if (this.retweetText) {
      return this.retweetText.length > this.retweetLimit;
    }
    return false;
  }

  get remainingCharacters() {
    if (this.retweetText) {
      return this.retweetLimit - this.retweetText.length;
    }
    return this.retweetLimit;
  }
}
