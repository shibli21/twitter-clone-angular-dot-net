import { AuthService } from './../../auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { User } from '../../auth/Models/user.model';

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.scss'],
})
export class ProfileCardComponent implements OnInit {
  currentUser!: User;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.user.subscribe((user) => {
      this.currentUser = user!;
    });
  }
}
