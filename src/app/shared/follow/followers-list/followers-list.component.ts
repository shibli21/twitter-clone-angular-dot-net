import { Router } from '@angular/router';
import { FollowService } from '../../../core/services/follow.service';
import { IPaginatedUsers } from '../../../core/models/user.model';
import { Component, Input, OnInit } from '@angular/core';
import { IUser } from 'src/app/core/models/user.model';

@Component({
  selector: 'app-followers-list',
  templateUrl: './followers-list.component.html',
  styleUrls: ['./followers-list.component.scss'],
})
export class FollowersListComponent implements OnInit {
  @Input() user!: IUser;
  followers: IPaginatedUsers = {
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
    this.followService.isLoadingUserFollowers.subscribe((isLoading) => {
      this.isLoading = isLoading;
    });

    this.followService.userFollowers.subscribe((followers) => {
      this.followers = followers;
    });

    this.followService.getFollowersByUserId(this.user.id);
  }

  showDialog() {
    this.display = true;
  }

  loadMoreFollowers() {
    this.followService.loadMoreUsersFollowers(this.user.id);
  }

  routeToProfile(userId: string) {
    this.router.navigate(['/profile', userId]);
    this.display = false;
  }
}
