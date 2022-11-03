import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { IUser } from 'src/app/core/models/user.model';
import { AuthService } from './../../auth/auth.service';
import { LiveNotificationService } from './../../core/services/live-notification.service';
import { NavService } from './../../core/services/nav.service';
import { NewTweetService } from './../../core/services/new-tweet.service';
import { NotificationService } from './../../core/services/notification.service';
import { SearchService } from './../../core/services/search.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
  providers: [ConfirmationService],
})
export class SideNavComponent implements OnInit {
  user!: IUser;
  searchQuery = '';
  display = false;
  totalUnreadNotifications = 0;

  constructor(
    private authService: AuthService,
    private navService: NavService,
    private router: Router,
    private searchService: SearchService,
    private newTweetService: NewTweetService,
    private liveNotificationService: LiveNotificationService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.liveNotificationService
      .startConnection(this.authService.userId()!)
      .then(() => {
        this.liveNotificationService.addReceiveNotificationListener();
      });

    if (this.router.url !== '/notifications') {
      this.notificationService.getNotifications();
    }

    this.notificationService.notifications.subscribe(
      (paginatedNotifications) => {
        this.totalUnreadNotifications = paginatedNotifications.totalUnread;
      }
    );

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
    this.confirmationService.confirm({
      key: 'side-logout',
      message: 'Are you sure that you want to logout?',
      accept: () => {
        this.authService.logout();
      },
    });
  }

  newTweet() {
    this.newTweetService.toggleTweetDialog();
  }

  isAdmin() {
    return this.user?.role === 'admin';
  }
}
