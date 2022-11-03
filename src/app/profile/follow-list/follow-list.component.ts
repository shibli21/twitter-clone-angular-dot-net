import { FollowService } from './../../core/services/follow.service';
import { ProfileService } from './../../core/services/profile.service';
import { Router, ActivatedRoute } from '@angular/router';
import { IUser, PaginatedUsers } from './../../core/models/user.model';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-follow-list',
  templateUrl: './follow-list.component.html',
  styleUrls: ['./follow-list.component.scss'],
})
export class FollowListComponent implements OnInit {
  user: IUser | null = null;
  activeIndex = 1;
  userId = '';

  constructor(
    private profileService: ProfileService,
    private followService: FollowService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.followService.followers.next(new PaginatedUsers());
    this.followService.following.next(new PaginatedUsers());

    this.route.params.subscribe((params) => {
      this.userId = params['userId'];
      this.profileService.getUserById(this.userId);
      this.followService.getFollowingByUserId(this.userId);
      this.followService.getFollowersByUserId(this.userId);
    });

    this.profileService.user.subscribe((user) => {
      if (user) {
        this.user = user;
      }
    });

    this.route.queryParams.subscribe((params) => {
      this.activeIndex = params['type'] === 'following' ? 1 : 0;
    });
  }

  replaceUrl() {
    this.activeIndex = this.activeIndex === 0 ? 1 : 0;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { type: this.activeIndex === 0 ? 'followers' : 'following' },
      queryParamsHandling: 'merge',
    });
  }
}
