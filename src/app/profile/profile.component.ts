import { ProfileService } from './../core/services/profile.service';
import { tap } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IPaginatedTweets, PaginatedTweets } from '../core/models/tweet.model';
import { PaginatedUsers, IUser } from '../core/models/user.model';
import { FollowService } from '../core/services/follow.service';
import { AuthService } from './../auth/auth.service';
import { BlockService } from './../core/services/block.service';
import { TimelineService } from './../core/services/timeline.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  usersTweets: IPaginatedTweets | null = null;
  userId!: string;
  profileUser: IUser | null = null;
  isLoading = false;
  isBlocking = false;
  isProfileLoading = false;
  isFollowUnFollowing = false;
  notFound = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private followService: FollowService,
    private blockService: BlockService,
    private router: Router,
    private timelineService: TimelineService,
    private profileService: ProfileService
  ) {}
  ngOnDestroy(): void {
    this.profileUser = null;
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.notFound = false;
      this.profileUser = null;
      this.userId = params['userId'];

      this.profileService.getUserById(this.userId);

      this.profileService.user.subscribe((user) => {
        this.profileUser = user;
      });

      this.profileService.isUserLoading.subscribe((isLoading) => {
        this.isProfileLoading = isLoading;
      });

      this.timelineService.userTimeline.next(new PaginatedTweets());

      this.timelineService.isLoadingUserTimeline.subscribe((isLoading) => {
        this.isLoading = isLoading;
      });

      this.timelineService.userTimeline.subscribe((userTweets) => {
        this.usersTweets = userTweets;
      });
      this.timelineService.getUserTimeline(this.userId, this.usersTweets?.page);
    });
  }

  followUnfollowUser() {
    this.isFollowUnFollowing = true;
    this.followService.followUnfollowUser(this.userId).subscribe({
      next: (res: any) => {
        this.toastr.success(res.message);
        if (this.profileUser) {
          this.profileUser.isFollowed = !this.profileUser.isFollowed;
        }
        this.isFollowUnFollowing = false;
      },
      error: (err) => {
        this.isFollowUnFollowing = false;
      },
    });
  }

  blockUserByUser() {
    this.isBlocking = true;
    this.blockService.blockUserByUser(this.userId).subscribe({
      next: (res: any) => {
        this.router.navigate(['/']);
        this.toastr.success('User blocked successfully');
        this.isBlocking = false;
      },
      error: (err) => {
        this.isBlocking = false;
      },
    });
  }

  loadMore() {
    this.timelineService.loadMoreUserTimeline(this.userId);
  }

  navigateToFollow(type: string) {
    this.router.navigateByUrl(
      `/profile/follow-list/${this.userId}?type=${type}`
    );
  }

  get isCurrentUserProfile() {
    return this.authService.userId() === this.userId;
  }
}
