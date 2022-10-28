import { PaginatedUsers } from 'src/app/core/models/user.model';
import { Router } from '@angular/router';
import { FollowService } from '../../../core/services/follow.service';
import { Component, Input, OnInit } from '@angular/core';
import { IPaginatedUsers, IUser } from '../../../core/models/user.model';

@Component({
  selector: 'app-following-list',
  templateUrl: './following-list.component.html',
  styleUrls: ['./following-list.component.scss'],
})
export class FollowingListComponent implements OnInit {
  @Input() user!: IUser;
  followings: IPaginatedUsers = new PaginatedUsers();

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
