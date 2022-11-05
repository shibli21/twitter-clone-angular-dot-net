import { IUser } from 'src/app/core/models/user.model';
import { UserService } from './../../core/services/user.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-authors-card',
  templateUrl: './authors-card.component.html',
  styleUrls: ['./authors-card.component.scss'],
})
export class AuthorsCardComponent implements OnInit {
  users: IUser[] = [];
  isLoading = false;

  constructor(private userService: UserService) {
    this.getAuthors();
  }

  ngOnInit(): void {}

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
