import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Tweet } from 'src/app/core/models/tweet.model';
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
  @Input() tweet!: Tweet;
  @Input() isRetweet? = false;

  comment = '';
  isCommenting = false;
  isEditing = false;
  isRetweeting = false;
  display: boolean = false;
  displayEditDialog: boolean = false;
  editTweet = '';
  retweetDisplay = false;
  retweetText = '';
  isCurrentUserId = '';

  constructor(
    private tweetService: TweetService,
    private commentService: CommentService,
    private toastr: ToastrService,
    private retweetService: RetweetService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.editTweet = this.tweet.tweet;

    this.isCurrentUserId = this.authService.userId()!;
  }

  showDialog() {
    this.display = true;
  }
  showEditDialog() {
    this.displayEditDialog = true;
  }

  showRetweetDialog() {
    this.retweetDisplay = true;
  }

  commentOnTweet() {
    this.isCommenting = true;
    this.commentService.commentOnTweet(this.tweet.id, this.comment).subscribe({
      next: () => {
        this.tweetService.getTweet(this.tweet.id).subscribe((res) => {
          this.tweet = res;
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

  onEditTweet() {
    this.isEditing = true;
    if (this.tweet?.type === 'Retweet') {
      this.tweetService.editRetweet(this.tweet.id, this.editTweet).subscribe({
        next: (res) => {
          this.isEditing = false;
          this.displayEditDialog = false;
        },
      });
    } else {
      this.tweetService.editTweet(this.tweet.id, this.editTweet).subscribe({
        next: (res) => {
          this.tweetService.getTweet(this.tweet.id).subscribe((res) => {
            this.isEditing = false;
            this.displayEditDialog = false;
          });
        },
      });
    }
  }

  deleteTweet() {
    this.tweetService.deleteTweet(this.tweet.id).subscribe({
      next: (res) => {
        this.toastr.success('Tweet deleted successfully');
      },
    });
  }

  retweet() {
    this.retweetService.retweet(this.tweet.id, this.retweetText).subscribe({
      next: () => {
        this.tweetService.getTweet(this.tweet.id).subscribe((res) => {
          this.tweet = res;
        });
        this.toastr.success('Retweeted successfully');
        this.retweetDisplay = false;
      },
    });
  }
}
