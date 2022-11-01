import { NavService } from './../../core/services/nav.service';
import { AuthService } from './../../auth/auth.service';
import { IUser } from 'src/app/core/models/user.model';
import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss'],
})
export class TopNavComponent implements OnInit {
  @Input() title: string = '';
  @Input() showBackButton = true;
  user!: IUser;
  sidenavDisplay = false;

  constructor(
    private location: Location,
    private authService: AuthService,
    private navService: NavService
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

  goBack() {
    this.location.back();
  }

  toggleSidebar() {
    this.sidenavDisplay = !this.sidenavDisplay;
  }

  navigateToHomeAndRefresh() {
    this.navService.refreshHome();
    this.sidenavDisplay = !this.sidenavDisplay;
  }

  navigateToProfileAndRefresh() {
    this.navService.refreshProfile();
    this.sidenavDisplay = !this.sidenavDisplay;
  }

  logout() {
    this.authService.logout();
  }

  isAdmin() {
    return this.user.role === 'admin';
  }
}
