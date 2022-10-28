import { IPaginatedNotifications } from './../models/notification.model';
import { BehaviorSubject, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  baseUrl = environment.baseUrl;
  notifications = new BehaviorSubject<IPaginatedNotifications>({
    page: 0,
    size: 0,
    totalElements: 0,
    lastPage: 0,
    totalPages: 0,
    notifications: [],
    totalUnread: 0,
  });
  isLoadingNotifications = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  getNotifications(page = 0, size = 20) {
    this.isLoadingNotifications.next(true);
    return this.http
      .get<IPaginatedNotifications>(
        this.baseUrl + 'notifications/all' + `?page=${page}&size=${size}`
      )
      .pipe(
        tap((paginatedNotification) => {
          const notifications = this.notifications.getValue();
          if (notifications) {
            paginatedNotification.notifications = [
              ...notifications.notifications,
              ...paginatedNotification.notifications,
            ];
          }
          this.notifications.next(paginatedNotification);
          this.isLoadingNotifications.next(false);
        })
      )
      .subscribe();
  }

  loadMoreNotifications() {
    const notifications = this.notifications.getValue();
    if (notifications && notifications.page < notifications.totalPages) {
      this.getNotifications(notifications.page + 1, 20);
    }
  }

  markAsRead(notificationId: string) {
    return this.http
      .put(this.baseUrl + 'notifications/' + notificationId, {})
      .pipe(
        tap((notification) => {
          const prevNotifications = this.notifications.getValue();

          const updatedNotifications: IPaginatedNotifications = {
            ...prevNotifications,
            totalUnread: prevNotifications.totalUnread - 1,
          };

          this.notifications.next(updatedNotifications);

          return notification;
        })
      );
  }
}
