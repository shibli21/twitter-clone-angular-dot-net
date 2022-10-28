import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';
import { Notification } from '../models/notification.model';
import { environment } from './../../../environments/environment';
import { ILoginResponse } from './../models/user.model';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class LiveNotificationService {
  private _hubConnection!: HubConnection;

  constructor(
    private notificationService: NotificationService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  async startConnection(userId: string) {
    const userAuthData = localStorage.getItem('userData')!;
    const { jwtToken } = JSON.parse(userAuthData) as ILoginResponse;

    this._hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.notificationHubUrl}?userId=${userId}`, {
        accessTokenFactory: () => jwtToken,
      })
      .build();

    try {
      await this._hubConnection.start();
      console.log('Connection started');
    } catch (err) {
      return console.log('Error while starting connection: ' + err);
    }
  }

  addReceiveNotificationListener() {
    this._hubConnection.on(
      'ReceiveNotification',
      (notification: Notification) => {
        let audio: HTMLAudioElement = new Audio('/assets/toast_sound.mp3');
        audio.play();
        const prevNotifications = this.notificationService.notifications.value;
        this.notificationService.notifications.next({
          ...prevNotifications,
          notifications: [notification, ...prevNotifications.notifications],
          totalUnread: prevNotifications.totalUnread + 1,
        });
        this.toastr
          .success(notification.message, 'New notification', {
            timeOut: 8000,
          })
          .onTap.subscribe(() => {
            if (notification.type === 'Follow') {
              this.router.navigate(['/profile', notification.refUserId]);
            } else {
              this.router.navigate(['/tweet', notification.tweetId]);
            }
          });
      }
    );
  }

  stopConnection() {
    return this._hubConnection.stop();
  }
}
