import { LoginResponse } from './../core/models/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from './../core/services/notification.service';
import {
  Notification,
  PaginatedNotifications,
} from './../core/models/notification.model';
import { Component, OnInit } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  private _hubConnection!: HubConnection;

  paginatedNotifications!: PaginatedNotifications | null;
  isLoading = false;

  constructor(
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.notificationService.notifications.next({
        notifications: [],
        lastPage: 0,
        page: 0,
        size: 0,
        totalElements: 0,
        totalPages: 0,
        totalUnread: 0,
      });

      this.notificationService.isLoadingNotifications.subscribe((isLoading) => {
        this.isLoading = isLoading;
      });

      this.notificationService.notifications.subscribe(
        (paginatedNotifications) => {
          this.paginatedNotifications = paginatedNotifications;
        }
      );

      this.notificationService.getNotifications(
        this.paginatedNotifications?.page
      );
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
