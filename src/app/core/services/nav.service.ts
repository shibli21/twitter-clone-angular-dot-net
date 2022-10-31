import { AuthService } from './../../auth/auth.service';
import { TimelineService } from './timeline.service';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { PaginatedTweets } from '../models/tweet.model';

@Injectable({
  providedIn: 'root',
})
export class NavService {
  constructor(
    private router: Router,
    private timelineService: TimelineService,
    private authService: AuthService
  ) {}

  refreshHome() {
    this.router.navigate(['/home']);
    window.scrollTo(0, 0);
    this.timelineService.newsFeed.next(new PaginatedTweets());
    this.timelineService.getNewsFeed();
  }

  refreshProfile() {
    window.scrollTo(0, 0);
    this.router
      .navigateByUrl('/', { skipLocationChange: true })
      .then(() =>
        this.router.navigate(['/profile', this.authService.userId()])
      );
  }
}
