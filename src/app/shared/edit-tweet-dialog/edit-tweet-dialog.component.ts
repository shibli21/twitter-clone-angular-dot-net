import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ITweet } from './../../core/models/tweet.model';
import { IUser } from './../../core/models/user.model';
import { TimelineService } from './../../core/services/timeline.service';
import { TweetService } from './../../core/services/tweet.service';

@Component({
  selector: 'app-edit-tweet-dialog',
  templateUrl: './edit-tweet-dialog.component.html',
  styleUrls: ['./edit-tweet-dialog.component.scss'],
})
export class EditTweetDialogComponent implements OnInit {
  @Input() visible = false;
  @Input() currentUser!: IUser;
  @Input() tweet!: ITweet;
  @Output() onCloseEvent = new EventEmitter();
  editTweet = '';
  isEditing = false;

  constructor(
    private timelineService: TimelineService,
    private tweetService: TweetService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.editTweet = this.tweet.tweet;
  }

  onEditTweet() {
    this.isEditing = true;
    if (this.tweet.type === 'Retweet') {
      this.tweetService.editRetweet(this.tweet.id, this.editTweet).subscribe({
        next: (updatedTweet) => {
          if (this.router.url.startsWith('/profile')) {
            this.timelineService.updateProfileTimeline(updatedTweet);
          } else {
            this.tweetService.updateTweet(updatedTweet);
          }
          this.isEditing = false;
          this.visible = false;
        },
        error: (err) => {
          this.isEditing = false;
          this.visible = false;
          console.log(err);
        },
      });
    } else {
      this.tweetService.editTweet(this.tweet.id, this.editTweet).subscribe({
        next: (updatedTweet) => {
          if (this.router.url.startsWith('/profile')) {
            this.timelineService.updateProfileTimeline(updatedTweet);
          } else {
            this.tweetService.updateTweet(updatedTweet);
          }
          this.isEditing = false;
          this.visible = false;
        },
        error: (err) => {
          this.isEditing = false;
          this.visible = false;
        },
      });
    }
  }

  onHide() {
    this.onCloseEvent.emit();
  }
}
