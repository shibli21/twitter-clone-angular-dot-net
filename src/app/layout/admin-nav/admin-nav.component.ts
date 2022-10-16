import { MenuItem } from 'primeng/api';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-nav',
  templateUrl: './admin-nav.component.html',
  styleUrls: ['./admin-nav.component.scss'],
})
export class AdminNavComponent implements OnInit {
  items!: MenuItem[];

  constructor() {
    this.items = [
      {
        label: 'Dashboard',
        icon: 'pi pi-th-large',
        routerLink: ['/admin/dashboard'],
      },
    ];
  }

  ngOnInit(): void {}
}
