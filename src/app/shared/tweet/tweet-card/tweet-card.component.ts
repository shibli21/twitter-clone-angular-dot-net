import { Observable } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { TimelineService } from './../../../core/services/timeline.service';
import { IUser } from './../../../core/models/user.model';
import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ITweet } from 'src/app/core/models/tweet.model';
import { CommentService } from '../../../core/services/comment.service';
import { TweetService } from '../../../core/services/tweet.service';
import { AuthService } from './../../../auth/auth.service';

@Component({
  selector: 'app-tweet-card',
  templateUrl: './tweet-card.component.html',
  styleUrls: ['./tweet-card.component.scss'],
  providers: [ConfirmationService],
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
  currentUser$ = new Observable<IUser | null>();

  constructor(
    private tweetService: TweetService,
    private commentService: CommentService,
    private toastr: ToastrService,
    private authService: AuthService,
    private timelineService: TimelineService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.currentUser$ = this.authService.userObservable;
  }

  showDialog() {
    this.display = true;
  }

  showEditDialog() {
    this.displayEditDialog = true;
  }

  showRetweetDialog() {
    if (
      this.tweet.userId === this.authService.userId() &&
      this.tweet.type === 'Retweet'
    ) {
      this.retweetUndoDisplay = true;
    } else {
      this.retweetDisplay = true;
    }
  }

  commentOnTweet() {
    this.isCommenting = true;
    this.commentService
      .commentOnTweetFromDialog(this.tweet.id, this.comment)
      .subscribe()
      .add(() => {
        this.isCommenting = false;
        this.display = false;
        this.comment = '';
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
    this.confirmationService.confirm({
      key: 'deleteTweet',
      message: 'Are you sure that you want to delete?',
      accept: () => {
        this.tweetService.deleteTweet(this.tweet.id).subscribe({
          next: (res) => {
            this.toastr.success('Tweet deleted successfully');
            this.timelineService.updateProfileTimelineAfterDelete(
              this.tweet.id
            );
          },
        });
      },
    });
  }
}
