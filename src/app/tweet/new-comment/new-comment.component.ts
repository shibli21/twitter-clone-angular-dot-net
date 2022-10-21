import { Component, Input, OnInit } from '@angular/core';
import { CommentService } from '../../core/services/comment.service';

@Component({
  selector: 'app-new-comment',
  templateUrl: './new-comment.component.html',
  styleUrls: ['./new-comment.component.scss'],
})
export class NewCommentComponent implements OnInit {
  @Input() tweetId = '';
  comment = '';
  isCommenting = false;

  constructor(private commentService: CommentService) {}

  ngOnInit(): void {}

  addComment() {
    this.isCommenting = true;
    if (this.tweetId) {
      this.commentService.commentOnTweet(this.tweetId, this.comment).subscribe({
        next: (comment) => {
          this.isCommenting = false;
          this.comment = '';
        },
        error: (err) => {
          this.isCommenting = false;
        },
      });
    }
  }
}
