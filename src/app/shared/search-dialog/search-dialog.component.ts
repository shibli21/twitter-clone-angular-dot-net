import { PaginatedUsers } from 'src/app/core/models/user.model';
import { PaginatedTweets } from './../../core/models/tweet.model';
import { Router } from '@angular/router';
import { SearchService } from './../../core/services/search.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-search-dialog',
  templateUrl: './search-dialog.component.html',
  styleUrls: ['./search-dialog.component.scss'],
})
export class SearchDialogComponent implements OnInit {
  display = false;
  searchQuery = '';

  constructor(private searchService: SearchService, private router: Router) {}

  ngOnInit(): void {
    this.searchService.isSearchDialogOpen.subscribe((isOpen) => {
      this.display = isOpen;
    });
  }

  onHide() {
    this.searchService.isSearchDialogOpen.next(false);
  }

  onSubmit() {
    this.searchService.onSearch(this.searchQuery);
    this.searchQuery = '';
  }
}
