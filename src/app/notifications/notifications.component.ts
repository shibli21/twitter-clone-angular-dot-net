import { Subject, takeUntil } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Notification,
  IPaginatedNotifications,
} from './../core/models/notification.model';
import { NotificationService } from './../core/services/notification.service';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit, OnDestroy {
  paginatedNotifications!: IPaginatedNotifications | null;
  isLoading = false;
  unsubscribe$ = new Subject();

  constructor(
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      const prevNot = this.notificationService.notificationValue;

      this.notificationService.setNotifications({
        notifications: [],
        lastPage: 0,
        page: 0,
        size: 0,
        totalElements: 0,
        totalPages: 0,
        totalUnread: prevNot.totalUnread,
      });

      this.notificationService.isLoadingNotificationsObservable
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((isLoading) => {
          this.isLoading = isLoading;
        });

      this.notificationService.notificationsObservable
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((paginatedNotifications) => {
          this.paginatedNotifications = paginatedNotifications;
        });

      this.notificationService.getNotifications();
    });
  }

  loadMore() {
    this.notificationService.loadMoreNotifications();
  }

  markAsRead(notification: Notification) {
    if (notification.isRead) {
      if (notification.type === 'Follow') {
        this.router.navigate(['/profile', notification.refUserId]);
      } else {
        this.router.navigate(['/tweet', notification.tweetId]);
      }
    } else {
      this.notificationService.markAsRead(notification.id).subscribe((res) => {
        if (notification.type === 'Follow') {
          this.router.navigate(['/profile', notification.refUserId]);
        } else {
          this.router.navigate(['/tweet', notification.tweetId]);
        }
      });
    }
  }

  getNotificationTypeIcon(type: string) {
    switch (type) {
      case 'Follow':
        return 'user';
      case 'Like':
        return 'heart';
      case 'Retweet':
        return 'share-alt';
      case 'Comment':
        return 'comment';
      default:
        return '';
    }
  }
}
