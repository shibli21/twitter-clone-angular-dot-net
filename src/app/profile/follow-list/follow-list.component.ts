import { FollowService } from './../../core/services/follow.service';
import { ProfileService } from './../../core/services/profile.service';
import { Router, ActivatedRoute } from '@angular/router';
import { IUser, PaginatedUsers } from './../../core/models/user.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-follow-list',
  templateUrl: './follow-list.component.html',
  styleUrls: ['./follow-list.component.scss'],
})
export class FollowListComponent implements OnInit, OnDestroy {
  user: IUser | null = null;
  activeIndex = 1;
  userId = '';

  unsubscribe$ = new Subject<any>();

  constructor(
    private profileService: ProfileService,
    private followService: FollowService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  ngOnDestroy(): void {
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete();
    this.followService.clearFollowersAndFollowing();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.userId = params['userId'];
      this.profileService.getUserById(this.userId);
      this.followService.getFollowingByUserId(this.userId);
      this.followService.getFollowersByUserId(this.userId);
    });

    this.profileService.userObservable
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((user) => {
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
