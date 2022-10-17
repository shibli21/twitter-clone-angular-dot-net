import { AuthService } from './../../auth/auth.service';
import { MenuItem } from 'primeng/api';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-nav',
  templateUrl: './admin-nav.component.html',
  styleUrls: ['./admin-nav.component.scss'],
})
export class AdminNavComponent implements OnInit {
  items!: MenuItem[];

  constructor(private authService: AuthService) {
    this.items = [
      {
        label: 'Dashboard',
        icon: 'pi pi-th-large',
        routerLink: ['/admin/dashboard'],
      },
      {
        label: 'Logout',
        icon: 'pi pi-fw pi-power-off',
        routerLink: ['/login'],
        command: () => {
          this.authService.logout();
        },
      },
    ];
  }

  ngOnInit(): void {}
}
