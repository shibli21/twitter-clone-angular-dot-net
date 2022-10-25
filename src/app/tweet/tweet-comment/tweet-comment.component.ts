import { AuthService } from './../../auth/auth.service';
import { Component, Input, OnInit } from '@angular/core';
import { Comment } from 'src/app/core/models/tweet.model';
import { CommentService } from '../../core/services/comment.service';

@Component({
  selector: 'app-tweet-comment',
  templateUrl: './tweet-comment.component.html',
  styleUrls: ['./tweet-comment.component.scss'],
})
export class TweetCommentComponent implements OnInit {
  @Input() comment!: Comment;

  constructor(
    private commentService: CommentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {}

  deleteComment() {
    this.commentService.deleteComment(this.comment.id).subscribe((res) => {});
  }

  get isCommentOwner() {
    return this.authService.userId() === this.comment.userId;
  }
}
