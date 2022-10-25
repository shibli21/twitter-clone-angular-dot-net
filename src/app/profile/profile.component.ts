import { Component, OnInit } from '@angular/core';
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
export class ProfileComponent implements OnInit {
  usersTweets!: PaginatedTweets | null;
  userId!: string;
  profileUser!: User;
  isCurrentUser: boolean = false;
  isLoading = false;
  isProfileLoading = false;
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

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.notFound = false;
      this.userId = params['userId'];

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

      if (this.userId === this.authService.userId()) {
        this.profileUser = this.authService.currentUserValue()!;
        this.isCurrentUser = true;
      } else {
        this.isProfileLoading = true;
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
    });
  }

  followUnfollowUser() {
    this.followService.followUnfollowUser(this.userId).subscribe((res: any) => {
      this.toastr.success(res.message);
      this.profileUser.isFollowed = !this.profileUser.isFollowed;
    });
  }

  blockUserByUser() {
    this.blockService.blockUserByUser(this.userId).subscribe((res: any) => {
      this.router.navigate(['/']);
      this.toastr.success('User blocked successfully');
    });
  }

  loadMore() {
    this.timelineService.loadMoreUserTimeline(this.userId);
  }
}
