import { Observable, Subject, takeUntil } from 'rxjs';
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
  user$ = new Observable<IUser | null>();

  totalUnreadNotifications = 0;
  unsubscribe$ = new Subject();

  constructor(
    private authService: AuthService,
    private navService: NavService,
    private searchService: SearchService,
    private newTweetService: NewTweetService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.user$ = this.authService.userObservable;

    if (this.router.url !== '/notifications') {
      this.notificationService.getNotifications();
    }

    this.notificationService.notificationsObservable
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((paginatedNotifications) => {
        this.totalUnreadNotifications = paginatedNotifications.totalUnread;
      });
  }

  navigateToHomeAndRefresh() {
    this.navService.refreshHome();
  }

  navigateToProfileAndRefresh() {
    this.navService.refreshProfile();
  }

  isMyProfileRouteActive() {
    return this.router.url.includes(this.authService.userId()!);
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
