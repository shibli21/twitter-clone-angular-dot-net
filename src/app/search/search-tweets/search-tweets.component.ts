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
    this.searchService.tweetSearchQuery.subscribe((query) => {
      this.tweetSearchQuery = query;
    });

    this.searchService.isSearchingTweets.subscribe((isLoading) => {
      this.isLoading = isLoading;
    });

    this.searchService.searchedTweets.subscribe((tweets) => {
      this.searchedTweets = tweets;
    });
  }

  loadMore() {
    this.searchService.loadMoreSearchedTweets();
  }
}
