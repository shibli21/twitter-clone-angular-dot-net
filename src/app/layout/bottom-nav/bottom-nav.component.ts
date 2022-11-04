import { NotificationService } from './../../core/services/notification.service';
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
  totalUnreadNotifications = 0;

  constructor(
    private authService: AuthService,
    private navService: NavService,
    private searchService: SearchService,
    private newTweetService: NewTweetService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.authService.user.subscribe((user) => (this.user = user!));

    if (this.router.url !== '/notifications') {
      this.notificationService.getNotifications();
    }

    this.notificationService.notifications.subscribe(
      (IPaginatedNotifications) => {
        this.totalUnreadNotifications = IPaginatedNotifications.totalUnread;
      }
    );
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
