import { TimelineService } from './../../core/services/timeline.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Observable, Subject, takeUntil } from 'rxjs';
import { IUser } from 'src/app/core/models/user.model';
import { AuthService } from './../../auth/auth.service';
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
export class SideNavComponent implements OnInit, OnDestroy {
  user$ = new Observable<IUser | null>();
  searchQuery = '';
  display = false;
  totalUnreadNotifications = 0;
  unsubscribe$ = new Subject<any>();
  isLoadingNewsFeed = false;
  isLoadingUserTimeLine = false;

  constructor(
    private authService: AuthService,
    private navService: NavService,
    private router: Router,
    private searchService: SearchService,
    private newTweetService: NewTweetService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService,
    private timelineService: TimelineService
  ) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    if (this.router.url !== '/notifications') {
      this.notificationService.getNotifications();
    }

    this.notificationService.notificationsObservable
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((paginatedNotifications) => {
        this.totalUnreadNotifications = paginatedNotifications.totalUnread;
      });

    this.user$ = this.authService.userObservable;

    this.searchService.isSearchDialogOpenObservable
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((isOpen) => {
        this.display = isOpen;
      });

    this.timelineService.isLoadingNewsFeedObservable
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((isLoading) => {
        this.isLoadingNewsFeed = isLoading;
      });

    this.timelineService.isLoadingUserTimelineObservable
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((isLoading) => {
        this.isLoadingUserTimeLine = isLoading;
      });
  }

  toggleSearchDialog() {
    this.searchService.toggleSearchDialog();
  }

  refreshNewsFeed() {
    if (!this.isLoadingNewsFeed) {
      this.navService.refreshHome();
    }
  }

  navigateToProfileAndRefresh() {
    if (!this.isLoadingUserTimeLine) {
      this.navService.refreshProfile();
    }
  }

  isMyProfileRouteActive() {
    return this.router.url.includes(this.authService.userId()!);
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
    return this.authService.currentUserValue()?.role === 'admin';
  }
}
