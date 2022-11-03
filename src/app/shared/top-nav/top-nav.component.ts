import { ConfirmationService } from 'primeng/api';
import { SearchService } from './../../core/services/search.service';
import { NavService } from './../../core/services/nav.service';
import { AuthService } from './../../auth/auth.service';
import { IUser } from 'src/app/core/models/user.model';
import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss'],
  providers: [ConfirmationService],
})
export class TopNavComponent implements OnInit {
  @Input() title: string = '';
  @Input() showBackButton = true;
  user!: IUser;
  sidenavDisplay = false;
  searchQuery = '';

  constructor(
    private location: Location,
    private authService: AuthService,
    private searchService: SearchService,
    private confirmationService: ConfirmationService,
    private navService: NavService
  ) {}

  ngOnInit(): void {
    if (this.location.path().includes('search/search-users')) {
      this.searchService.searchQuery.subscribe((query) => {
        this.searchQuery = query;
      });
    } else {
      this.searchService.tweetSearchQuery.subscribe((query) => {
        this.searchQuery = query;
      });
    }

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
    this.sidenavDisplay = false;
    this.confirmationService.confirm({
      key: 'top-logout',
      message: 'Are you sure that you want to logout?',
      accept: () => {
        this.authService.logout();
      },
    });
  }

  isAdmin() {
    return this.user.role === 'admin';
  }

  onSearch() {
    this.searchService.onSearch(this.searchQuery);
  }

  isSearchPage() {
    return this.location.path().includes('search');
  }
}
