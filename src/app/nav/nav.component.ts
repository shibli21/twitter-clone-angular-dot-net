import { AuthService } from './../auth/auth.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  private authSub!: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authSub = this.authService.authCredential.subscribe(
      (authCredential) => {
        this.isAuthenticated = !!authCredential;
      }
    );
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }

  onLogout() {
    this.authService.logout();
  }
}
