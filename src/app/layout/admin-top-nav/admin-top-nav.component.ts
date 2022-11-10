import { AuthService } from './../../core/services/auth.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { IUser } from 'src/app/core/models/user.model';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-top-nav',
  templateUrl: './admin-top-nav.component.html',
  styleUrls: ['./admin-top-nav.component.scss'],
  providers: [ConfirmationService],
})
export class AdminTopNavComponent implements OnInit {
  user$ = new Observable<IUser | null>();
  sidenavDisplay = false;

  constructor(
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user$ = this.authService.userObservable;
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
