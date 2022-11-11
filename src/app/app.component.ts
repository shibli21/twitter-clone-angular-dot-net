import { NotificationService } from './core/services/notification.service';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { Component } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(
    private authService: AuthService,
    private meta: Meta,
    private title: Title,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.meta.addTags([
      { name: 'description', content: 'Twitter Clone' },
      { name: 'keywords', content: 'Twitter Clone' },
      { name: 'author', content: 'Syed shibli mahmud - Masum Billah' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, shrink-to-fit=no',
      },
      { name: 'robots', content: 'index, follow' },
      { charset: 'UTF-8' },
    ]);
    this.title.setTitle('Geeky - Twitter Clone');

    this.authService.autoLogin();

    if (this.router.url !== '/notifications') {
      this.notificationService.getNotifications();
    }
  }
}
