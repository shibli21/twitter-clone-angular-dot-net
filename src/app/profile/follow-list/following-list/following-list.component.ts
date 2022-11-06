import { Subject, takeUntil } from 'rxjs';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PaginatedUsers } from 'src/app/core/models/user.model';
import { IPaginatedUsers } from '../../../core/models/user.model';
import { FollowService } from '../../../core/services/follow.service';

@Component({
  selector: 'app-following-list',
  templateUrl: './following-list.component.html',
  styleUrls: ['./following-list.component.scss'],
})
export class FollowingListComponent implements OnInit, OnDestroy {
  @Input() userId = '';
  following: IPaginatedUsers | null = null;
  isLoadingFollowing = false;
  private unsubscribe$: Subject<any> = new Subject<any>();

  constructor(private followService: FollowService, private router: Router) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.followService.followingObservable
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((following) => {
        this.following = following;
      });

    this.followService.isLoadingFollowingObservable
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((isLoading) => {
        this.isLoadingFollowing = isLoading;
      });
  }

  loadMoreFollowing() {
    this.followService.loadMoreFollowing(this.userId);
  }

  routeToProfile(userId: string) {
    this.router.navigate(['/profile', userId]);
  }
}
