import { tap } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PaginatedTweets } from '../core/models/tweet.model';
import { User } from '../core/models/user.model';
import { FollowService } from '../core/services/follow.service';
import { AuthService } from './../auth/auth.service';
import { BlockService } from './../core/services/block.service';
import { TimelineService } from './../core/services/timeline.service';
import { UserService } from './user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  usersTweets: PaginatedTweets | null = null;
  userId!: string;
  profileUser: User | null = null;
  isCurrentUser: boolean = false;
  isLoading = false;
  isBlocking = false;
  isProfileLoading = false;
  isFollowUnFollowing = false;
  notFound = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private followService: FollowService,
    private blockService: BlockService,
    private router: Router,
    private timelineService: TimelineService
  ) {}
  ngOnDestroy(): void {
    this.profileUser = null;
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.notFound = false;
      this.userId = params['userId'];

      this.profileUser = null;

      this.isProfileLoading = true;

      if (this.userId === this.authService.userId()) {
        this.authService.currentUser().subscribe({
          next: (res) => {
            this.profileUser = res;
            this.isCurrentUser = true;
            this.isProfileLoading = false;
          },
          error: (err) => {
            this.isProfileLoading = false;
            this.notFound = true;
          },
        });
      } else {
        this.userService.getUserById(this.userId).subscribe({
          next: (user) => {
            this.profileUser = user;
            this.isCurrentUser = false;
            this.isProfileLoading = false;
          },
          error: (err) => {
            this.isCurrentUser = false;
            this.isProfileLoading = false;
            this.notFound = true;
          },
        });
      }

      this.timelineService.userTimeline.next({
        tweets: [],
        page: 0,
        totalPages: 0,
        totalElements: 0,
        lastPage: 0,
        size: 0,
      });

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
    this.followService
      .followUnfollowUser(this.userId)
      .pipe(
        tap((res) => {
          this.followService.userFollowers.next({
            lastPage: 0,
            page: 0,
            size: 0,
            totalElements: 0,
            totalPages: 0,
            users: [],
          });
          this.followService.getFollowersByUserId(this.userId);
        })
      )
      .subscribe({
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
}
