import { MenuItem } from 'primeng/api';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  items!: MenuItem[];

  constructor() {}

  ngOnInit(): void {
    this.items = [
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
      },
      {
        label: 'Block user',
        icon: 'pi pi-fw pi-power-off',
      },
    ];
  }
}
