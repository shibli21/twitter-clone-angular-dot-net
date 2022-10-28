import { FollowService } from './../../core/services/follow.service';
import { AuthService } from './../../auth/auth.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PaginatedUsers, IUser } from '../../core/models/user.model';

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.scss'],
})
export class ProfileCardComponent implements OnInit, OnDestroy {
  currentUser!: IUser;
  display = false;
  constructor(
    private authService: AuthService,
    private followService: FollowService
  ) {}
  ngOnDestroy(): void {
    this.followService.myFollowers.next(new PaginatedUsers());
    this.followService.myFollowings.next(new PaginatedUsers());
  }

  ngOnInit(): void {
    this.authService.user.subscribe((user) => {
      this.currentUser = user!;
    });
  }
}
