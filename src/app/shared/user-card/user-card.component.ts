import { AuthService } from './../../auth/auth.service';
import { FollowService } from './../../core/services/follow.service';
import { IUser } from 'src/app/core/models/user.model';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss'],
})
export class UserCardComponent implements OnInit {
  @Input() user!: IUser;

  constructor(
    private followService: FollowService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {}

  followUnfollowUser() {
    this.followService.followUnfollowUser(this.user.id).subscribe();
  }

  get currentUserId() {
    return this.authService.userId();
  }
}
