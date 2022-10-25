import { PaginatedTweets } from './../core/models/tweet.model';
import { TimelineService } from './../core/services/timeline.service';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  newsFeed!: PaginatedTweets | null;
  isLoading = false;
  constructor(private timelineService: TimelineService) {}

  ngOnDestroy(): void {
    this.timelineService.newsFeed.next({
      tweets: [],
      page: 0,
      totalPages: 0,
      lastPage: 0,
      size: 0,
      totalElements: 0,
    });
  }

  ngOnInit(): void {
    this.timelineService.isLoadingNewsFeed.subscribe((isLoading) => {
      this.isLoading = isLoading;
    });

    this.timelineService.newsFeed.subscribe((newsFeed) => {
      this.newsFeed = newsFeed;
    });

    this.timelineService.getNewsFeed(this.newsFeed?.page);
  }

  loadMore() {
    this.timelineService.loadMoreNewsFeed();
  }
}
