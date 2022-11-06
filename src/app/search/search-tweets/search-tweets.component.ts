import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { IPaginatedTweets } from './../../core/models/tweet.model';
import { SearchService } from './../../core/services/search.service';

@Component({
  selector: 'app-search-tweets',
  templateUrl: './search-tweets.component.html',
  styleUrls: ['./search-tweets.component.scss'],
})
export class SearchTweetsComponent implements OnInit, OnDestroy {
  searchedTweets!: IPaginatedTweets | null;
  tweetSearchQuery!: string;
  isLoading = false;

  private unsubscribe$: Subject<any> = new Subject<any>();

  constructor(private searchService: SearchService) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.searchService.tweetSearchQueryObservable
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((query) => {
        this.tweetSearchQuery = query;
      });

    this.searchService.isSearchingTweetsObservable
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((isLoading) => {
        this.isLoading = isLoading;
      });

    this.searchService.searchedTweetsObservable
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((tweets) => {
        this.searchedTweets = tweets;
      });
  }

  loadMore() {
    this.searchService.loadMoreSearchedTweets();
  }
}
