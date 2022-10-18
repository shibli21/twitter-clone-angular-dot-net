import { UserService } from './user.service';
import { ActivatedRoute } from '@angular/router';
import { TweetService } from './../tweet/tweet.service';
import { Tweet } from './../tweet/models/tweet.model';
import { AuthService } from './../auth/auth.service';
import { MenuItem } from 'primeng/api';
import { Component, OnInit } from '@angular/core';
import { User } from '../auth/Models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  items!: MenuItem[];
  usersTweets: Tweet[] = [];
  userId!: string;
  profileUser!: User;
  isCurrentUser: boolean = false;

  constructor(
    private authService: AuthService,
    private tweetService: TweetService,
    private userService: UserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.userId = params['userId'];
      this.tweetService.getUserTweets(this.userId).subscribe((tweets) => {
        this.usersTweets = tweets;
      });
      if (this.userId === this.authService.userId()) {
        this.profileUser = this.authService.currentUserValue()!;
        this.isCurrentUser = true;
      } else {
        this.userService.getUserById(this.userId).subscribe((user) => {
          this.profileUser = user;
        });
      }
    });

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
  }
}
