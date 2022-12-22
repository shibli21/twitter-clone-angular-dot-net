import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-layout',
  templateUrl: './user-layout.component.html',
  styleUrls: ['./user-layout.component.scss'],
})
export class UserLayoutComponent implements OnInit {
  constructor(private location: Location) {}

  ngOnInit(): void {}

  get isSearchPage() {
    return this.location.path().includes('search');
  }
}
