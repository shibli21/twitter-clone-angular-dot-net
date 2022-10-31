import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IUser } from 'src/app/core/models/user.model';
import { AuthService } from './../../auth/auth.service';
import { NavService } from './../../core/services/nav.service';
import { NewTweetService } from './../../core/services/new-tweet.service';
import { SearchService } from './../../core/services/search.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
})
export class SideNavComponent implements OnInit {
  user!: IUser;
  searchQuery = '';
  display = false;

  constructor(
    private authService: AuthService,
    private navService: NavService,
    private router: Router,
    private searchService: SearchService,
    private newTweetService: NewTweetService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser().subscribe((user) => {
      this.user = user;
    });
    this.searchService.isSearchDialogOpen.subscribe((isOpen) => {
      this.display = isOpen;
    });
  }

  toggleSearchDialog() {
    this.searchService.toggleSearchDialog();
  }

  navigateToHomeAndRefresh() {
    this.navService.refreshHome();
  }

  navigateToProfileAndRefresh() {
    this.navService.refreshProfile();
  }

  isMyProfileRouteActive() {
    return this.router.url.includes(this.user?.id);
  }

  isActive(route: string) {
    return this.router.url.includes(route);
  }

  logout() {
    this.authService.logout();
  }

  newTweet() {
    this.newTweetService.toggleTweetDialog();
  }
}
