import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { MenuItem } from 'primeng/api';
import { Notification } from 'src/app/core/models/notification.model';
import { environment } from 'src/environments/environment';
import { AuthService } from './../../auth/auth.service';
import { LoginResponse } from './../../core/models/user.model';
import { NotificationService } from './../../core/services/notification.service';
import { SearchService } from './../../core/services/search.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit {
  searchQuery!: string;
  totalUnreadNotifications = 0;
  display = false;

  items: MenuItem[] = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      routerLink: ['/home'],
    },

    {
      label: 'Profile',
      icon: 'pi pi-fw pi-user',
      items: [
        {
          label: 'My Profile',
          icon: 'pi pi-fw pi-user-edit',
          routerLink: ['/profile', this.authService.userId()],
        },
        {
          label: 'Edit',
          icon: 'pi pi-pencil',
          routerLink: ['/profile/edit', this.authService.userId()],
        },
        {
          label: 'Block list',
          icon: 'pi pi-circle-fill',
          routerLink: [`/profile/block/users`],
        },
        {
          label: 'Logout',
          icon: 'pi pi-fw pi-power-off',
          routerLink: ['/login'],
          command: () => {
            this.authService.logout();
          },
        },
      ],
    },
    {
      label: 'Admin',
      icon: 'pi pi-key',
      routerLink: ['/admin'],
      visible: this.authService.isAdmin(),
    },
  ];

  private _hubConnection!: HubConnection;
  constructor(
    private authService: AuthService,
    private searchService: SearchService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    const userAuthData = localStorage.getItem('userData')!;
    const { jwtToken } = JSON.parse(userAuthData) as LoginResponse;

    this._hubConnection = new HubConnectionBuilder()
      .withUrl(environment.notificationHubUrl, {
        accessTokenFactory: () => jwtToken,
      })
      .build();

    this._hubConnection
      .start()
      .then(() => {
        console.log('Connection started');
      })
      .catch((err) => console.log('Error while starting connection: ' + err));

    this._hubConnection.on(
      'ReceiveNotification',
      (notification: Notification) => {
        const prevNotifications = this.notificationService.notifications.value;
        this.notificationService.notifications.next({
          ...prevNotifications,
          notifications: [notification, ...prevNotifications.notifications],
          totalUnread: prevNotifications.totalUnread + 1,
        });
      }
    );

    this.notificationService.getNotifications();

    this.notificationService.notifications.subscribe(
      (paginatedNotifications) => {
        this.totalUnreadNotifications = paginatedNotifications.totalUnread;
      }
    );
  }

  onSubmit() {
    this.display = false;
    if (this.searchQuery.startsWith('#')) {
      this.searchService.tweetSearchQuery.next(this.searchQuery);
      if (this.router.url !== '/search/search-tweets') {
        this.router.navigate(['/search/search-tweets']);
      }
    } else {
      this.searchService.searchQuery.next(this.searchQuery);
      if (this.router.url !== '/search/search-users') {
        this.router.navigate(['/search/search-users']);
      }
    }
    this.searchQuery = '';
  }
}
