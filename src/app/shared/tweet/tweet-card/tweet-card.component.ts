import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MenuItem } from 'primeng/api';
import { Tweet } from 'src/app/core/models/tweet.model';
import { RetweetService } from './../../../core/services/retweet.service';
import { CommentService } from '../../../core/services/comment.service';
import { TweetService } from '../../../core/services/tweet.service';

@Component({
  selector: 'app-tweet-card',
  templateUrl: './tweet-card.component.html',
  styleUrls: ['./tweet-card.component.scss'],
})
export class TweetCardComponent implements OnInit {
  items!: MenuItem[];
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

  constructor(
    private tweetService: TweetService,
    private commentService: CommentService,
    private toastr: ToastrService,
    private retweetService: RetweetService
  ) {}

  ngOnInit() {
    this.items = [
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => {
          this.showEditDialog();
        },
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => {
          this.deleteTweet();
        },
      },
    ];
    this.editTweet = this.tweet.tweet;
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
        });
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
    this.tweetService.editTweet(this.tweet.id, this.editTweet).subscribe({
      next: (res) => {
        this.tweetService.getTweet(this.tweet.id).subscribe((res) => {
          this.tweet = res;
          this.displayEditDialog = false;
          this.isEditing = false;
        });
      },
    });
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
