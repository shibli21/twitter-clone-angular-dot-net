import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit {
  items!: MenuItem[];

  constructor() {}
  ngOnInit() {
    this.items = [
      {
        label: 'Home',
        icon: 'ti ti-home',
        routerLink: ['/home'],
      },
      {
        label: 'Notifications',
        icon: 'pi pi-fw pi-bell',
        badge: '50',
        routerLink: ['/notifications'],
      },
      {
        label: 'Profile',
        icon: 'pi pi-fw pi-user',
        items: [
          {
            label: 'My Profile',
            icon: 'pi pi-fw pi-user-edit',
            routerLink: ['/profile'],
          },
          {
            label: 'Edit',
            icon: 'pi pi-pencil',
            routerLink: ['/profile/edit'],
          },
          {
            label: 'Logout',
            icon: 'pi pi-fw pi-power-off',
            routerLink: ['/login'],
          },
        ],
      },
      // {
      //   label: 'Search',
      //   icon: 'pi pi-fw pi-search',
      //   routerLink: ['/search'],
      // },
      // {
      //   label: 'Logout',
      //   icon: 'pi pi-fw pi-power-off',
      // },
    ];
  }
}
