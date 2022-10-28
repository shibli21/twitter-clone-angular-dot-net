import { TimelineService } from './../../../core/services/timeline.service';
import { IUser } from './../../../core/models/user.model';
import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ITweet } from 'src/app/core/models/tweet.model';
import { CommentService } from '../../../core/services/comment.service';
import { TweetService } from '../../../core/services/tweet.service';
import { AuthService } from './../../../auth/auth.service';
import { RetweetService } from './../../../core/services/retweet.service';

@Component({
  selector: 'app-tweet-card',
  templateUrl: './tweet-card.component.html',
  styleUrls: ['./tweet-card.component.scss'],
})
export class TweetCardComponent implements OnInit {
  @Input() tweet!: ITweet;
  @Input() isRetweet? = false;

  comment = '';
  isCommenting = false;
  display: boolean = false;
  displayEditDialog: boolean = false;
  retweetDisplay = false;
  retweetUndoDisplay = false;
  currentUser!: IUser;

  constructor(
    private tweetService: TweetService,
    private commentService: CommentService,
    private toastr: ToastrService,
    private authService: AuthService,
    private timelineService: TimelineService
  ) {}

  ngOnInit() {
    this.authService.user.subscribe((res) => {
      if (res) {
        this.currentUser = res;
      }
    });
  }

  showDialog() {
    this.display = true;
  }

  showEditDialog() {
    this.displayEditDialog = true;
  }

  showRetweetDialog() {
    if (
      this.tweet.userId === this.currentUser.id &&
      this.tweet.type === 'Retweet'
    ) {
      this.retweetUndoDisplay = true;
    } else {
      this.retweetDisplay = true;
    }
  }

  commentOnTweet() {
    this.isCommenting = true;
    this.commentService.commentOnTweet(this.tweet.id, this.comment).subscribe({
      next: (res) => {
        this.tweetService.getTweet(this.tweet.id).subscribe((res) => {
          this.tweet = res;
          this.comment = '';
          this.display = false;
          this.isCommenting = false;
        });
      },
      error: (err) => {
        this.isCommenting = false;
        this.display = false;
        this.comment = '';
      },
    });
  }

  likeUnlike() {
    this.tweetService.likeTweet(this.tweet.id).subscribe({
      next: (res) => {
        this.tweetService.getTweet(this.tweet.id).subscribe((res) => {
          this.tweet = res;
        });
      },
    });
  }

  deleteTweet() {
    this.tweetService.deleteTweet(this.tweet.id).subscribe({
      next: (res) => {
        this.toastr.success('Tweet deleted successfully');
        this.timelineService.updateProfileTimelineAfterDelete(this.tweet.id);
      },
    });
  }
}
