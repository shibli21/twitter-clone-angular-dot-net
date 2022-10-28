import { Router } from '@angular/router';
import { SearchService } from './../../core/services/search.service';
import { IPaginatedUsers } from 'src/app/core/models/user.model';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-search-users',
  templateUrl: './search-users.component.html',
  styleUrls: ['./search-users.component.scss'],
})
export class SearchUsersComponent implements OnInit {
  searchedUsers!: IPaginatedUsers | null;
  searchQuery!: string;
  isLoading = false;

  constructor(private searchService: SearchService, private router: Router) {}

  ngOnInit(): void {
    this.searchService.searchQuery.subscribe((query) => {
      this.searchQuery = query;
    });

    this.searchService.isSearchingUsers.subscribe((isLoading) => {
      this.isLoading = isLoading;
    });

    this.searchService.searchedUsers.subscribe((users) => {
      this.searchedUsers = users;
    });
  }

  loadMore() {
    this.searchService.loadMoreSearchedUsers();
  }
}
