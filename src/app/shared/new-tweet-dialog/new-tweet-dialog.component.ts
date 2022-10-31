import { AuthService } from './../../auth/auth.service';
import { IUser } from 'src/app/core/models/user.model';
import { NewTweetService } from './../../core/services/new-tweet.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-new-tweet-dialog',
  templateUrl: './new-tweet-dialog.component.html',
  styleUrls: ['./new-tweet-dialog.component.scss'],
})
export class NewTweetDialogComponent implements OnInit {
  display = false;
  tweet: string = '';
  user!: IUser;
  isLoading = false;

  constructor(
    private newTweetService: NewTweetService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.newTweetService.isTweetDialogOpen.subscribe((isOpen) => {
      this.display = isOpen;
    });
    this.authService.user.subscribe((user) => {
      if (user) {
        this.user = user;
      }
    });
    this.newTweetService.isTweeting.subscribe((isTweeting) => {
      this.isLoading = isTweeting;
    });
  }

  onHide() {
    this.newTweetService.isTweetDialogOpen.next(false);
  }

  onSubmit() {
    this.newTweetService.tweet(this.tweet);
    this.tweet = '';
  }
}
