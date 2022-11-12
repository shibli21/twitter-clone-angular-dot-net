import { ProfileService } from './../../core/services/profile.service';
import { ToastrService } from 'ngx-toastr';
import { Component, Input, OnInit } from '@angular/core';
import { IUser } from 'src/app/core/models/user.model';
import { AuthService } from './../../core/services/auth.service';
import { FollowService } from './../../core/services/follow.service';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss'],
})
export class UserCardComponent implements OnInit {
  @Input() user!: IUser;
  isFollowingLoading = false;

  constructor(
    private followService: FollowService,
    private authService: AuthService,
    private profileService: ProfileService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {}

  followUnfollowUser(event: Event) {
    event.stopPropagation();
    this.isFollowingLoading = true;
    this.followService.followUnfollowUser(this.user.id).subscribe({
      next: (res: any) => {
        this.isFollowingLoading = false;
        this.user.isFollowed = !this.user.isFollowed;
        this.toastr.clear();
        this.toastr.success(res.message);

        if (this.user.isFollowed) {
          this.profileService.updateFollowFollowingCount(1);
        } else {
          this.profileService.updateFollowFollowingCount(-1);
        }
      },
      error: (err) => {
        this.isFollowingLoading = false;
        this.toastr.clear();
      },
    });
  }

  get currentUserId() {
    return this.authService.userId();
  }
}
