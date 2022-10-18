import { TweetService } from './../tweet.service';
import { Component, Input, OnInit } from '@angular/core';
import { Comment } from '../models/tweet.model';

@Component({
  selector: 'app-tweet-comment',
  templateUrl: './tweet-comment.component.html',
  styleUrls: ['./tweet-comment.component.scss'],
})
export class TweetCommentComponent implements OnInit {
  @Input() comment!: Comment;

  constructor(private tweetService: TweetService) {}

  ngOnInit(): void {}

  deleteComment() {
    this.tweetService.deleteComment(this.comment.id).subscribe((res) => {
      console.log(res);

      this.tweetService.getComments(this.comment.tweetId).subscribe((res) => {
        console.log(res);
      });
    });
  }
}
