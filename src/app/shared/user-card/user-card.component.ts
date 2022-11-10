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
