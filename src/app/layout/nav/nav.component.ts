import { Router, ActivatedRoute } from '@angular/router';
import { SearchService } from './../../core/services/search.service';
import { AuthService } from './../../auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit {
  items!: MenuItem[];
  searchQuery!: string;

  constructor(
    private authService: AuthService,
    private searchService: SearchService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-home',
        routerLink: ['/home'],
      },
      {
        label: 'Notifications',
        icon: 'pi pi-fw pi-bell',
        badge: '50',
        routerLink: ['/notifications'],
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
  }

  onSubmit() {
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
