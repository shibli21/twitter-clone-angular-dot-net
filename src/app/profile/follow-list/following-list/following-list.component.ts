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
export class FollowingListComponent implements OnInit {
  @Input() userId = '';
  following: IPaginatedUsers | null = null;
  isLoadingFollowing = false;

  constructor(private followService: FollowService, private router: Router) {}

  ngOnInit(): void {
    this.followService.following.subscribe((following) => {
      this.following = following;
    });

    this.followService.isLoadingFollowing.subscribe((isLoading) => {
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
