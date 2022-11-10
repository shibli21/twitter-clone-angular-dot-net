import { AuthService } from './../../core/services/auth.service';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-side-nav',
  templateUrl: './admin-side-nav.component.html',
  styleUrls: ['./admin-side-nav.component.scss'],
  providers: [ConfirmationService],
})
export class AdminSideNavComponent implements OnInit {
  constructor(
    private confirmationService: ConfirmationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  logout() {
    this.confirmationService.confirm({
      key: 'side-logout',
      message: 'Are you sure that you want to logout?',
      accept: () => {
        this.authService.logout();
      },
    });
  }

  isActive(route: string) {
    return this.router.url.includes(route);
  }
}
