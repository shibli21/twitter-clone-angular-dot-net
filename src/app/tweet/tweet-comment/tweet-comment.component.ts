import { Component, Input, OnInit } from '@angular/core';
import { Comment } from '../models/tweet.model';
import { CommentService } from './../comment.service';

@Component({
  selector: 'app-tweet-comment',
  templateUrl: './tweet-comment.component.html',
  styleUrls: ['./tweet-comment.component.scss'],
})
export class TweetCommentComponent implements OnInit {
  @Input() comment!: Comment;

  constructor(private commentService: CommentService) {}

  ngOnInit(): void {}

  deleteComment() {
    this.commentService.deleteComment(this.comment.id).subscribe((res) => {
      this.commentService.getComments(this.comment.tweetId).subscribe((res) => {
        this.commentService.comments.next(res);
      });
    });
  }
}
