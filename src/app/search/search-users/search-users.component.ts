import { Router } from '@angular/router';
import { SearchService } from './../../core/services/search.service';
import { PaginatedUsers } from 'src/app/core/models/user.model';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-search-users',
  templateUrl: './search-users.component.html',
  styleUrls: ['./search-users.component.scss'],
})
export class SearchUsersComponent implements OnInit {
  searchedUsers!: PaginatedUsers | null;
  searchQuery!: string;
  isLoading = false;

  constructor(private searchService: SearchService, private router: Router) {}

  ngOnInit(): void {
    this.searchService.isSearchingUsers.subscribe((isLoading) => {
      this.isLoading = isLoading;
    });

    this.searchService.searchedUsers.subscribe((users) => {
      this.searchedUsers = users;
    });

    this.searchService.searchQuery.subscribe((query) => {
      this.searchService.searchedUsers.next({
        page: 0,
        users: [],
        lastPage: 0,
        size: 0,
        totalElements: 0,
        totalPages: 0,
      });
      this.searchQuery = query;
      this.searchService.getSearchUsers();
    });
  }

  loadMore() {
    this.searchService.loadMoreSearchedUsers();
  }
}
