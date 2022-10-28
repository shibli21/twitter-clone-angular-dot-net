import { FollowService } from './../../core/services/follow.service';
import { AuthService } from './../../auth/auth.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.scss'],
})
export class ProfileCardComponent implements OnInit, OnDestroy {
  currentUser!: User;
  display = false;
  constructor(
    private authService: AuthService,
    private followService: FollowService
  ) {}
  ngOnDestroy(): void {
    this.followService.myFollowers.next({
      lastPage: 0,
      page: 0,
      size: 0,
      totalElements: 0,
      totalPages: 0,
      users: [],
    });
    this.followService.myFollowings.next({
      lastPage: 0,
      page: 0,
      size: 0,
      totalElements: 0,
      totalPages: 0,
      users: [],
    });
  }

  ngOnInit(): void {
    this.authService.user.subscribe((user) => {
      this.currentUser = user!;
    });
  }
}
