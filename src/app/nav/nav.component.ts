import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './../auth/auth.service';
import { User } from './../users/model/user';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit, OnDestroy {
  events: string[] = [];
  opened: boolean = false;

  onToggle() {
    this.opened = !this.opened;
  }

  user!: User | null;
  isAuthenticated = false;
  private authSub!: Subscription;
  private userSub!: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.authSub = this.authService.authCredential.subscribe(
      (authCredential) => {
        this.isAuthenticated = !!authCredential;
      }
    );
    this.userSub = this.authService.user.subscribe((user) => {
      this.user = user;
    });
    this.breakpointObserver
      .observe(['(max-width: 767px)'])
      .subscribe((result: BreakpointState) => {
        if (!result.matches) {
          this.opened = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
    this.userSub.unsubscribe();
  }

  onLogout() {
    this.authService.logout();
  }

  onNavigate(path: string) {
    this.router.navigate([path]);
    this.opened = false;
  }
}
