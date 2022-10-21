import { Router } from '@angular/router';
import { FollowService } from '../../../core/services/follow.service';
import { Component, Input, OnInit } from '@angular/core';
import { PaginatedUsers, User } from './../../../auth/Models/user.model';

@Component({
  selector: 'app-following-list',
  templateUrl: './following-list.component.html',
  styleUrls: ['./following-list.component.scss'],
})
export class FollowingListComponent implements OnInit {
  @Input() followingCount = 0;
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
    this.followService
      .getFollowingsByUserId(this.user.id, this.followings.page)
      .subscribe((res) => {
        this.followings = res;
      });
  }

  showDialog() {
    this.display = true;
  }

  loadMoreFollowings() {
    this.isLoading = true;
    if (this.followings.page < this.followings.lastPage) {
      this.followings.page++;
      this.followService
        .getFollowingsByUserId(this.user.id, this.followings.page)
        .subscribe((res) => {
          this.isLoading = false;
          this.followings.users = this.followings.users.concat(res.users);
        });
    } else {
    }
  }

  routeToProfile(userId: string) {
    this.router.navigate(['/profile', userId]);
    this.display = false;
  }
}
