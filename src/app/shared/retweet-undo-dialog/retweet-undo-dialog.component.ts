import { ToastrModule } from 'ngx-toastr';
import { TweetService } from './../../core/services/tweet.service';
import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { Tweet } from 'src/app/core/models/tweet.model';
import { User } from 'src/app/core/models/user.model';

@Component({
  selector: 'app-retweet-undo-dialog',
  templateUrl: './retweet-undo-dialog.component.html',
  styleUrls: ['./retweet-undo-dialog.component.scss'],
})
export class RetweetUndoDialogComponent implements OnInit {
  @Input() visible = false;
  @Input() currentUser!: User;
  @Input() tweet!: Tweet;
  @Output() onCloseEvent = new EventEmitter();

  isUndoing = false;

  constructor(
    private tweetService: TweetService,
    private toastr: ToastrModule
  ) {}

  ngOnInit(): void {}

  onHide() {
    this.onCloseEvent.emit();
  }

  undoRetweet() {
    this.isUndoing = true;
    this.tweetService
      .deleteTweet(this.tweet.id)
      .subscribe(() => {
        this.isUndoing = false;
        this.onHide();
      })
      .add(() => (this.isUndoing = false));
  }
}
