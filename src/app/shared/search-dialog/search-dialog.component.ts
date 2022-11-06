import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SearchService } from './../../core/services/search.service';

@Component({
  selector: 'app-search-dialog',
  templateUrl: './search-dialog.component.html',
  styleUrls: ['./search-dialog.component.scss'],
})
export class SearchDialogComponent implements OnInit, OnDestroy {
  display = false;
  searchQuery = '';

  private unsubscribe$: Subject<any> = new Subject<any>();

  constructor(private searchService: SearchService, private router: Router) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.searchService.isSearchDialogOpenObservable
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((isOpen) => {
        this.display = isOpen;
      });
  }

  onHide() {
    this.searchService.setIsSearchDialogOpen(false);
  }

  onSubmit() {
    this.searchService.onSearch(this.searchQuery);
    this.searchQuery = '';
  }
}
