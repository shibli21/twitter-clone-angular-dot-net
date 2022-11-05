import { IUser } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-followers-card',
  templateUrl: './followers-card.component.html',
  styleUrls: ['./followers-card.component.scss'],
})
export class FollowersCardComponent implements OnInit {
  users: IUser[] = [];
  isLoading = false;

  constructor(private userService: UserService) {
    this.getYouMayFollow();
  }

  ngOnInit(): void {}

  getYouMayFollow() {
    this.isLoading = true;
    this.userService.getYouMayFollow().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      },
    });
  }

  getAuthors() {
    this.userService.getAuthors().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      },
    });
  }
}
