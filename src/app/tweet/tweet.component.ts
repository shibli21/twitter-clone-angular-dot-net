import { User } from 'src/app/core/models/user.model';
import { AuthService } from './../auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Tweet } from '../core/models/tweet.model';
import { CommentService } from '../core/services/comment.service';
import { TweetService } from '../core/services/tweet.service';
import { PaginatedComments } from './../core/models/tweet.model';
import { RetweetService } from './../core/services/retweet.service';

@Component({
  selector: 'app-tweet',
  templateUrl: './tweet.component.html',
  styleUrls: ['./tweet.component.scss'],
})
export class TweetComponent implements OnInit {
  display = false;
  retweetDisplay = false;
  tweet!: Tweet | null;
  comment = '';
  tweetId = '';
  isCommenting = false;
  isLoading = false;
  currentUser!: User;
  notFound = false;

  tweetComments!: PaginatedComments | null;

  constructor(
    private tweetService: TweetService,
    private router: Router,
    private route: ActivatedRoute,
    private commentService: CommentService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.route.params.subscribe((params) => {
      this.tweetId = params['id'];

      this.commentService.comments.next({
        comments: [],
        page: 0,
        totalPages: 0,
        totalElements: 0,
        lastPage: 0,
        size: 0,
      });

      this.isLoading = true;
      this.tweetService.getTweet(this.tweetId).subscribe({
        next: (res) => {
          this.tweet = res;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.notFound = true;
        },
      });

      this.tweetService.tweet.subscribe((res) => {
        this.tweet = res;
      });

      this.commentService.isLoadingComment.subscribe((isLoading) => {
        this.isCommenting = isLoading;
      });

      this.commentService.comments.subscribe((tweetComments) => {
        this.tweetComments = tweetComments;
      });

      this.commentService.getTweetComments(this.tweetId);

      this.authService.user.subscribe((user) => {
        if (user) {
          this.currentUser = user;
        }
      });
    });
  }

  likeUnlike() {
    if (this.tweet) {
      this.tweetService.likeTweet(this.tweet.id).subscribe({
        next: (res) => {
          this.tweetService.getTweet(this.tweetId).subscribe();
        },
      });
    }
  }

  showRetweetDialog() {
    this.retweetDisplay = true;
  }

  deleteTweet() {
    this.tweetService.deleteTweet(this.tweetId).subscribe({
      next: (res) => {
        this.router.navigate(['/profile', this.currentUser.id]);
        this.toastr.success('Tweet deleted successfully');
      },
    });
  }

  loadMore() {
    if (this.tweetComments) {
      this.commentService.loadMoreComments(this.tweetId);
    }
  }
}
