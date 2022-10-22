import { SearchService } from './../../core/services/search.service';
import { PaginatedTweets } from './../../core/models/tweet.model';
import { PaginatedUsers } from 'src/app/core/models/user.model';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-search-tweets',
  templateUrl: './search-tweets.component.html',
  styleUrls: ['./search-tweets.component.scss'],
})
export class SearchTweetsComponent implements OnInit {
  searchedTweets!: PaginatedTweets | null;
  tweetSearchQuery!: string;
  isLoading = false;

  constructor(private searchService: SearchService) {}

  ngOnInit(): void {
    this.searchService.isSearchingTweets.subscribe((isLoading) => {
      this.isLoading = isLoading;
    });

    this.searchService.tweetSearchQuery.subscribe((query) => {
      this.searchService.searchedTweets.next({
        page: 0,
        tweets: [],
        lastPage: 0,
        size: 0,
        totalElements: 0,
        totalPages: 0,
      });
      this.tweetSearchQuery = query;
      this.searchService.getSearchTweets();
    });

    this.searchService.searchedTweets.subscribe((tweets) => {
      this.searchedTweets = tweets;
    });
  }

  loadMore() {
    this.searchService.loadMoreSearchedTweets();
  }
}
