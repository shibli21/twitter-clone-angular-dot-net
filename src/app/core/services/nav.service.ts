import { ProfileService } from './profile.service';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { TimelineService } from './timeline.service';

@Injectable({
  providedIn: 'root',
})
export class NavService {
  constructor(
    private router: Router,
    private timelineService: TimelineService,
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  refreshHome() {
    window.scrollTo(0, 0);
    if (this.router.url === '/home') {
      this.timelineService.clearNewsFeed();
      this.timelineService.getNewsFeed();
    }
  }

  refreshProfile() {
    window.scrollTo(0, 0);
    this.timelineService.clearUserTimeLine();
    this.profileService.clearUser();
    if (this.router.url.includes('/profile/')) {
      this.profileService.getUserById(this.authService.userId()!);
      this.timelineService.getUserTimeline(this.authService.userId()!);
    } else {
      this.router.navigate(['/profile', this.authService.userId()]);
    }
  }
}
