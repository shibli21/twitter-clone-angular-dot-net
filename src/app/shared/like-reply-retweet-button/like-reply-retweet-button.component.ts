import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-like-reply-retweet-button',
  templateUrl: './like-reply-retweet-button.component.html',
  styleUrls: ['./like-reply-retweet-button.component.scss'],
})
export class LikeReplyRetweetButtonComponent implements OnInit {
  @Output() onLikeEvent = new EventEmitter();
  @Output() onRetweetEvent = new EventEmitter();
  @Output() onCommentEvent = new EventEmitter();
  @Input() isLiked = false;
  @Input() likeCount = 0;
  @Input() commentCount = 0;
  @Input() retweetCount = 0;

  constructor() {}

  ngOnInit(): void {}

  like() {
    this.onLikeEvent.emit();
  }

  retweet() {
    this.onRetweetEvent.emit();
  }

  comment() {
    this.onCommentEvent.emit();
  }
}
