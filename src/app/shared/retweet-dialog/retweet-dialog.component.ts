import { Router } from '@angular/router';
import { TweetService } from './../../core/services/tweet.service';
import { TimelineService } from './../../core/services/timeline.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Tweet } from './../../core/models/tweet.model';
import { User } from './../../core/models/user.model';
import { RetweetService } from './../../core/services/retweet.service';

@Component({
  selector: 'app-retweet-dialog',
  templateUrl: './retweet-dialog.component.html',
  styleUrls: ['./retweet-dialog.component.scss'],
})
export class RetweetDialogComponent implements OnInit {
  @Input() visible = false;
  @Input() currentUser!: User;
  @Input() tweet!: Tweet;
  @Output() onCloseEvent = new EventEmitter();

  retweetText!: string;
  isRetweeting = false;

  constructor(
    private router: Router,
    private retweetService: RetweetService,
    private toastr: ToastrService,
    private timelineService: TimelineService,
    private tweetService: TweetService
  ) {}

  ngOnInit(): void {}

  retweet() {
    this.isRetweeting = true;
    const retweetTweetId = this.tweet.refTweet
      ? this.tweet.refTweet.id
      : this.tweet.id;

    this.retweetService.retweet(retweetTweetId, this.retweetText).subscribe({
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
          this.tweetService.updateTweet(res);
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
}
