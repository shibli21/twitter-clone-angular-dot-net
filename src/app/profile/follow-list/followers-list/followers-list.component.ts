import { PaginatedUsers } from './../../../core/models/user.model';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IPaginatedUsers } from '../../../core/models/user.model';
import { FollowService } from '../../../core/services/follow.service';

@Component({
  selector: 'app-followers-list',
  templateUrl: './followers-list.component.html',
  styleUrls: ['./followers-list.component.scss'],
})
export class FollowersListComponent implements OnInit {
  @Input() userId = '';
  followers: IPaginatedUsers | null = null;
  isLoadingFollowers = false;

  constructor(private followService: FollowService, private router: Router) {}

  ngOnInit(): void {
    this.followService.followers.subscribe((followers) => {
      this.followers = followers;
    });

    this.followService.isLoadingFollowers.subscribe((isLoading) => {
      this.isLoadingFollowers = isLoading;
    });
  }

  loadMoreFollowers() {
    this.followService.loadMoreFollowers(this.userId);
  }

  routeToProfile(userId: string) {
    this.router.navigate(['/profile', userId]);
  }
}
