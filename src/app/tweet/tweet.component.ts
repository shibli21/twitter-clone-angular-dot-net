import { AuthService } from './../core/services/auth.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { Observable, Subject, takeUntil } from 'rxjs';
import { IUser } from 'src/app/core/models/user.model';
import { ITweet } from '../core/models/tweet.model';
import { CommentService } from '../core/services/comment.service';
import { TweetService } from '../core/services/tweet.service';
import { IPaginatedComments } from './../core/models/tweet.model';

@Component({
  selector: 'app-tweet',
  templateUrl: './tweet.component.html',
  styleUrls: ['./tweet.component.scss'],
  providers: [ConfirmationService],
})
export class TweetComponent implements OnInit, OnDestroy {
  display = false;
  retweetDisplay = false;
  retweetUndoDisplay = false;
  deleteLoading = false;
  tweet!: ITweet | null;
  comment = '';
  tweetId = '';
  isCommenting = false;
  isLoading = false;
  currentUser$ = new Observable<IUser | null>();

  notFound = false;

  tweetComments!: IPaginatedComments | null;

  unsubscribe$ = new Subject();

  constructor(
    private tweetService: TweetService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private router: Router,
    private commentService: CommentService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}
  ngOnDestroy(): void {
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete();
  }

  ngOnInit() {
    this.isLoading = true;
    this.route.params.subscribe((params) => {
      this.tweetId = params['id'];

      this.commentService.setComments({
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

      this.tweetService.tweetObservable
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          this.tweet = res;
        });

      this.commentService.isLoadingCommentObservable
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((isLoading) => {
          this.isCommenting = isLoading;
        });

      this.commentService.commentsObservable
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((tweetComments) => {
          this.tweetComments = tweetComments;
        });

      this.commentService.getTweetComments(this.tweetId);

      this.currentUser$ = this.authService.userObservable;
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
    if (
      this.tweet?.userId === this.authService.userId()! &&
      this.tweet.type === 'Retweet'
    ) {
      this.retweetUndoDisplay = true;
    } else {
      this.retweetDisplay = true;
    }
  }

  deleteTweet() {
    this.confirmationService.confirm({
      key: 'deleteSingleTweet',
      message: 'Are you sure that you want to delete?',
      accept: () => {
        this.deleteLoading = true;
        this.tweetService.deleteTweet(this.tweetId).subscribe({
          next: (res) => {
            this.router.navigate(['/profile', this.authService.userId()]);
            this.toastr.success('Tweet deleted successfully');
            this.deleteLoading = false;
          },
          error: (err) => {
            this.toastr.error('Error deleting tweet');
            this.deleteLoading = false;
          },
        });
      },
    });
  }

  loadMore() {
    if (this.tweetComments) {
      this.commentService.loadMoreComments(this.tweetId);
    }
  }
}
