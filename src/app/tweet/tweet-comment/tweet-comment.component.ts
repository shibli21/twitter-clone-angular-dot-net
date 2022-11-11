import { AuthService } from './../../core/services/auth.service';
import { TweetService } from './../../core/services/tweet.service';
import { ConfirmationService } from 'primeng/api';
import { Component, Input, OnInit } from '@angular/core';
import { Comment } from 'src/app/core/models/tweet.model';
import { CommentService } from '../../core/services/comment.service';

@Component({
  selector: 'app-tweet-comment',
  templateUrl: './tweet-comment.component.html',
  styleUrls: ['./tweet-comment.component.scss'],
  providers: [ConfirmationService],
})
export class TweetCommentComponent implements OnInit {
  @Input() comment!: Comment;
  deleteLoading = false;

  constructor(
    private commentService: CommentService,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
    private tweetService: TweetService
  ) {}

  ngOnInit(): void {}

  deleteComment() {
    this.confirmationService.confirm({
      key: 'deleteComment',
      message: 'Are you sure that you want to delete?',
      accept: () => {
        this.deleteLoading = true;
        this.commentService.deleteComment(this.comment.id).subscribe({
          next: (res) => {
            this.deleteLoading = false;
          },
          error: (err) => {
            this.deleteLoading = false;
          },
        });
      },
    });
  }

  get isCommentOwner() {
    return (
      this.authService.userId() === this.comment.userId ||
      this.authService.userId() === this.tweetService.tweetValue?.userId
    );
  }
}
