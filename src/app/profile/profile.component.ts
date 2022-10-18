import { TweetService } from './../tweet/tweet.service';
import { Tweet } from './../tweet/models/tweet.model';
import { AuthService } from './../auth/auth.service';
import { MenuItem } from 'primeng/api';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  items!: MenuItem[];
  usersTweets: Tweet[] = [];

  constructor(
    private authService: AuthService,
    private tweetService: TweetService
  ) {}

  ngOnInit(): void {
    this.items = [
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
      },
      {
        label: 'Block user',
        icon: 'pi pi-fw pi-power-off',
      },
    ];

    if (this.authService.userId) {
      this.tweetService
        .getUsersTweets(this.authService.userId()!)
        .subscribe((res) => {
          this.usersTweets = res;
        });
    }
  }
}
