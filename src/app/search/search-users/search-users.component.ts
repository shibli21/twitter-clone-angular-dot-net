import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { IPaginatedUsers } from 'src/app/core/models/user.model';
import { SearchService } from './../../core/services/search.service';

@Component({
  selector: 'app-search-users',
  templateUrl: './search-users.component.html',
  styleUrls: ['./search-users.component.scss'],
})
export class SearchUsersComponent implements OnInit, OnDestroy {
  searchedUsers!: IPaginatedUsers | null;
  searchQuery!: string;
  isLoading = false;

  private unsubscribe$: Subject<any> = new Subject<any>();

  constructor(private searchService: SearchService, private router: Router) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.searchService.searchQueryObservable
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((query) => {
        this.searchQuery = query;
      });

    this.searchService.isSearchingUsersObservable
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((isLoading) => {
        this.isLoading = isLoading;
      });

    this.searchService.searchedUsersObservable
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((users) => {
        this.searchedUsers = users;
      });
  }

  loadMore() {
    this.searchService.loadMoreSearchedUsers();
  }
}
