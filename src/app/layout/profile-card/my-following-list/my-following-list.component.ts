import {
  IPaginatedUsers,
  PaginatedUsers,
} from './../../../core/models/user.model';
import { Router } from '@angular/router';
import { FollowService } from './../../../core/services/follow.service';
import { Component, Input, OnInit } from '@angular/core';
import { IUser } from 'src/app/core/models/user.model';

@Component({
  selector: 'app-my-following-list',
  templateUrl: './my-following-list.component.html',
  styleUrls: ['./my-following-list.component.scss'],
})
export class MyFollowingListComponent implements OnInit {
  @Input() user!: IUser;
  followings: IPaginatedUsers = new PaginatedUsers();

  isLoading = false;
  display = false;

  constructor(private followService: FollowService, private router: Router) {}

  ngOnInit(): void {
    this.followService.isLoadingMyFollowings.subscribe((isLoading) => {
      this.isLoading = isLoading;
    });

    this.followService.myFollowings.subscribe((followings) => {
      this.followings = followings;
    });

    this.followService.getMyFollowings();
  }

  showDialog() {
    this.display = true;
  }

  loadMoreFollowings() {
    this.followService.loadMoreMyFollowings();
  }

  routeToProfile(userId: string) {
    this.router.navigate(['/profile', userId]);
    this.display = false;
  }
}