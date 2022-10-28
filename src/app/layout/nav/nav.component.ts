import { PaginatedUsers } from 'src/app/core/models/user.model';
import { PaginatedTweets } from './../../core/models/tweet.model';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AuthService } from './../../auth/auth.service';
import { LiveNotificationService } from './../../core/services/live-notification.service';
import { NotificationService } from './../../core/services/notification.service';
import { SearchService } from './../../core/services/search.service';
import { TimelineService } from './../../core/services/timeline.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit {
  searchQuery!: string;
  totalUnreadNotifications = 0;
  display = false;

  items!: MenuItem[];
  constructor(
    private authService: AuthService,
    private searchService: SearchService,
    private router: Router,
    private notificationService: NotificationService,
    private timelineService: TimelineService,
    private liveNotificationService: LiveNotificationService
  ) {}

  ngOnInit() {
    this.liveNotificationService
      .startConnection(this.authService.userId()!)
      .then(() => {
        this.liveNotificationService.addReceiveNotificationListener();
      });

    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-home',
        routerLink: ['/home'],
        command: () => {
          window.scrollTo(0, 0);
          this.timelineService.newsFeed.next(new PaginatedTweets());
          this.timelineService.getNewsFeed();
        },
      },

      {
        label: 'Profile',
        icon: 'pi pi-fw pi-user',
        items: [
          {
            label: 'My Profile',
            icon: 'pi pi-fw pi-user-edit',
            routerLink: ['/profile', this.authService.userId()],
            command: () => {
              window.scrollTo(0, 0);
              this.router
                .navigateByUrl('/', { skipLocationChange: true })
                .then(() =>
                  this.router.navigate(['/profile', this.authService.userId()])
                );
            },
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

    if (this.router.url !== '/notifications') {
      this.notificationService.getNotifications();
    }

    this.notificationService.notifications.subscribe(
      (IPaginatedNotifications) => {
        this.totalUnreadNotifications = IPaginatedNotifications.totalUnread;
      }
    );
  }

  onSubmit() {
    this.display = false;

    if (this.searchQuery.startsWith('#')) {
      this.searchService.searchedTweets.next(new PaginatedTweets());

      this.searchService.tweetSearchQuery.next(this.searchQuery);
      if (this.router.url !== '/search/search-tweets') {
        this.router.navigate(['/search/search-tweets']);
      }
      this.searchService.getSearchTweets();
    } else {
      this.searchService.searchedUsers.next(new PaginatedUsers());

      this.searchService.searchQuery.next(this.searchQuery);
      if (this.router.url !== '/search/search-users') {
        this.router.navigate(['/search/search-users']);
      }
      this.searchService.getSearchUsers();
    }

    this.searchQuery = '';
  }
}
