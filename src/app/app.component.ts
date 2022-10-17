import { UsersService } from './users/users.service';
import { AuthService } from './auth/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'LearnathonLerningPhase';

  constructor(
    private authService: AuthService,
    private usersService: UsersService
  ) {}

  ngOnInit() {
    this.authService.autoLogin();

    this.authService.user.subscribe((user) => {
      if (user?.username) {
        this.usersService.setUserOnline().subscribe(() => {
          this.usersService.getOnlineUsers().subscribe();
        });
      }
    });
  }
}
