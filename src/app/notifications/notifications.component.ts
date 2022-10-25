import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Notification,
  PaginatedNotifications,
} from './../core/models/notification.model';
import { NotificationService } from './../core/services/notification.service';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  paginatedNotifications!: PaginatedNotifications | null;
  isLoading = false;

  constructor(
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      const prevNot = this.notificationService.notifications.getValue();

      if (prevNot) {
        this.notificationService.isLoadingNotifications.subscribe(
          (isLoading) => {
            this.isLoading = isLoading;
          }
        );
        this.notificationService.notifications.subscribe(
          (paginatedNotifications) => {
            this.paginatedNotifications = paginatedNotifications;
          }
        );
      } else {
        this.notificationService.getNotifications(
          this.paginatedNotifications?.page
        );
      }
    });
  }

  loadMore() {
    this.notificationService.loadMoreNotifications();
  }

  markAsRead(notification: Notification) {
    this.notificationService.markAsRead(notification.id).subscribe(() => {
      this.router.navigate(['/tweet', notification.tweetId]);
    });
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
