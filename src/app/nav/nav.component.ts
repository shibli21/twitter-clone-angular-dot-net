import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from './../auth/auth.service';
import { User } from './../users/model/user';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit, OnDestroy {
  user!: User | null;
  isAuthenticated = false;
  private authSub!: Subscription;
  private userSub!: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authSub = this.authService.authCredential.subscribe(
      (authCredential) => {
        this.isAuthenticated = !!authCredential;
      }
    );
    this.userSub = this.authService.user.subscribe((user) => {
      this.user = user;
    });
    console.log(this.user);
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
    this.userSub.unsubscribe();
  }

  onLogout() {
    this.authService.logout();
  }
}
