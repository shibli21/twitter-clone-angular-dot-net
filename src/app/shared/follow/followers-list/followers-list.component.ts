import { Router } from '@angular/router';
import { FollowService } from './../follow.service';
import { PaginatedUsers } from './../../../auth/Models/user.model';
import { Component, Input, OnInit } from '@angular/core';
import { User } from 'src/app/auth/Models/user.model';

@Component({
  selector: 'app-followers-list',
  templateUrl: './followers-list.component.html',
  styleUrls: ['./followers-list.component.scss'],
})
export class FollowersListComponent implements OnInit {
  @Input() followersCount = 0;
  @Input() user!: User;
  followers: PaginatedUsers = {
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
      .getFollowersByUserId(this.user.id, this.followers.page)
      .subscribe((res) => {
        this.followers = res;
      });
  }

  showDialog() {
    this.display = true;
  }

  onScrollDown() {
    this.isLoading = true;
    if (this.followers.page < this.followers.lastPage) {
      this.followers.page++;
      this.followService
        .getFollowersByUserId(this.user.id, this.followers.page)
        .subscribe((res) => {
          this.isLoading = false;
          this.followers.users = this.followers.users.concat(res.users);
        });
    } else {
    }
  }
  routeToProfile(userId: string) {
    this.router.navigate(['/profile', userId]);
    this.display = false;
  }
}
