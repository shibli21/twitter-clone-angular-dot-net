import { Router } from '@angular/router';
import { FollowService } from '../../../core/services/follow.service';
import { Component, Input, OnInit } from '@angular/core';
import { PaginatedUsers, User } from '../../../core/models/user.model';

@Component({
  selector: 'app-following-list',
  templateUrl: './following-list.component.html',
  styleUrls: ['./following-list.component.scss'],
})
export class FollowingListComponent implements OnInit {
  @Input() user!: User;
  followings: PaginatedUsers = {
    lastPage: 0,
    page: 0,
    size: 0,
    totalElements: 0,
    totalPages: 0,
    users: [],
  };

  isLoading = false;
  display = false;

  constructor(private followService: FollowService, private router: Router) {}

  ngOnInit(): void {
    this.followService.isLoadingUserFollowings.subscribe((isLoading) => {
      this.isLoading = isLoading;
    });

    this.followService.userFollowings.subscribe((followings) => {
      this.followings = followings;
    });

    this.followService.getFollowingsByUserId(this.user.id);
  }

  showDialog() {
    this.display = true;
  }

  loadMoreFollowings() {
    this.followService.loadMoreUsersFollowings(this.user.id);
  }

  routeToProfile(userId: string) {
    this.router.navigate(['/profile', userId]);
    this.display = false;
  }
}
