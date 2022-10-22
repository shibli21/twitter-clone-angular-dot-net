import { FollowService } from './../../core/services/follow.service';
import { User } from 'src/app/core/models/user.model';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss'],
})
export class UserCardComponent implements OnInit {
  @Input() user!: User;

  constructor(private followService: FollowService) {}

  ngOnInit(): void {}

  followUnfollowUser() {
    this.followService.followUnfollowUser(this.user.id).subscribe();
  }
}
