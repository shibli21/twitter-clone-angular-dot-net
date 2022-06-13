import { AuthService } from './../auth/auth.service';
import { User } from './../users/model/user';
import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  user!: User | null;
  private userSub!: Subscription;

  constructor(private authService: AuthService) {
    this.userSub = this.authService.user.subscribe((user) => {
      this.user = user;
    });
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }

  ngOnInit() {}
}
