import { PaginatedUsers } from './../../../core/models/user.model';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IPaginatedUsers } from '../../../core/models/user.model';
import { FollowService } from '../../../core/services/follow.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-followers-list',
  templateUrl: './followers-list.component.html',
  styleUrls: ['./followers-list.component.scss'],
})
export class FollowersListComponent implements OnInit, OnDestroy {
  @Input() userId = '';
  followers: IPaginatedUsers | null = null;
  isLoadingFollowers = false;
  private unsubscribe$: Subject<any> = new Subject<any>();

  constructor(private followService: FollowService, private router: Router) {}
  ngOnDestroy(): void {
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.followService.followersObservable
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((followers) => {
        this.followers = followers;
      });

    this.followService.isLoadingFollowersObservable
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((isLoading) => {
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
