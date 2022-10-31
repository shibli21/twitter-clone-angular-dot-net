import { NewTweetService } from './../../core/services/new-tweet.service';
import { SearchService } from './../../core/services/search.service';
import { Router } from '@angular/router';
import { NavService } from './../../core/services/nav.service';
import { IUser } from './../../core/models/user.model';
import { AuthService } from './../../auth/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bottom-nav',
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss'],
})
export class BottomNavComponent implements OnInit {
  user!: IUser;

  constructor(
    private authService: AuthService,
    private navService: NavService,
    private searchService: SearchService,
    private newTweetService: NewTweetService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser().subscribe((user) => {
      this.user = user;
    });
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

  toggleSearchDialog() {
    this.searchService.toggleSearchDialog();
  }

  toggleNewTweetDialog() {
    this.newTweetService.toggleTweetDialog();
  }
}
