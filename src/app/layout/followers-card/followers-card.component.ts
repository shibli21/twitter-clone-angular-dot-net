import { User } from '../../core/models/user.model';
import { UserService } from './../../profile/user.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-followers-card',
  templateUrl: './followers-card.component.html',
  styleUrls: ['./followers-card.component.scss'],
})
export class FollowersCardComponent implements OnInit {
  users: User[] = [];

  constructor(private userService: UserService) {
    this.getYouMayFollow();
  }

  ngOnInit(): void {}

  getYouMayFollow() {
    this.userService.getYouMayFollow().subscribe((users) => {
      this.users = users;
    });
  }
}
