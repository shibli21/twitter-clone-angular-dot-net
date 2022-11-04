import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { AuthService } from './../../auth/auth.service';
import { IUser } from 'src/app/core/models/user.model';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-top-nav',
  templateUrl: './admin-top-nav.component.html',
  styleUrls: ['./admin-top-nav.component.scss'],
  providers: [ConfirmationService],
})
export class AdminTopNavComponent implements OnInit {
  user!: IUser;
  sidenavDisplay = false;

  constructor(
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.user.subscribe({
      next: (res) => {
        if (res) {
          this.user = res;
        }
      },
    });
  }
  toggleSidebar() {
    this.sidenavDisplay = !this.sidenavDisplay;
  }

  logout() {
    this.sidenavDisplay = false;
    this.confirmationService.confirm({
      key: 'top-admin-logout',
      message: 'Are you sure that you want to logout?',
      accept: () => {
        this.authService.logout();
      },
    });
  }

  routeToAndCloseSidenav(route: string) {
    this.sidenavDisplay = false;
    this.router.navigate([route]);
  }
}
