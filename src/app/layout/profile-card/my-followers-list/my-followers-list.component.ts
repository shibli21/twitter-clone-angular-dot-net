import {
  IPaginatedUsers,
  PaginatedUsers,
  IUser,
} from './../../../core/models/user.model';
import { Router } from '@angular/router';
import { FollowService } from './../../../core/services/follow.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-my-followers-list',
  templateUrl: './my-followers-list.component.html',
  styleUrls: ['./my-followers-list.component.scss'],
})
export class MyFollowersListComponent implements OnInit {
  @Input() user!: IUser;
  followers: IPaginatedUsers = new PaginatedUsers();

  isLoading = false;
  display = false;

  constructor(private followService: FollowService, private router: Router) {}

  ngOnInit(): void {
    this.followService.isLoadingMyFollowers.subscribe((isLoading) => {
      this.isLoading = isLoading;
    });

    this.followService.myFollowers.subscribe((followers) => {
      this.followers = followers;
    });

    this.followService.getMyFollowers();
  }

  showDialog() {
    this.display = true;
  }

  loadMoreFollowers() {
    this.followService.loadMoreMyFollowers();
  }

  routeToProfile(userId: string) {
    this.router.navigate(['/profile', userId]);
    this.display = false;
  }
}
