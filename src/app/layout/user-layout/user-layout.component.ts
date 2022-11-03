import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SearchService } from './../../core/services/search.service';

@Component({
  selector: 'app-user-layout',
  templateUrl: './user-layout.component.html',
  styleUrls: ['./user-layout.component.scss'],
})
export class UserLayoutComponent implements OnInit {
  searchQuery = '';

  constructor(
    private searchService: SearchService,
    private location: Location
  ) {}

  ngOnInit(): void {}

  onSearch() {
    this.searchService.onSearch(this.searchQuery);
    this.searchQuery = '';
  }

  get isSearchPage() {
    return this.location.path().includes('search');
  }
}
