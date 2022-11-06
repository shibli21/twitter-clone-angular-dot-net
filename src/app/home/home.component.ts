import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import {
  IPaginatedTweets,
  PaginatedTweets,
} from './../core/models/tweet.model';
import { TimelineService } from './../core/services/timeline.service';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  newsFeed!: IPaginatedTweets | null;
  isLoading = false;
  private unsubscribe$: Subject<any> = new Subject<any>();

  constructor(
    private timelineService: TimelineService,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete();
    this.timelineService.clearNewsFeed();
  }

  ngOnInit(): void {
    this.timelineService.isLoadingNewsFeedObservable
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((isLoading) => {
        this.isLoading = isLoading;
      });

    this.timelineService.newFeedObservable
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((newsFeed) => {
        this.newsFeed = newsFeed;
      });

    this.timelineService.getNewsFeed();
  }

  loadMore() {
    this.timelineService.loadMoreNewsFeed();
  }
}
