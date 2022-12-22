import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IUser } from 'src/app/core/models/user.model';
import { SearchService } from './../../core/services/search.service';

@Component({
  selector: 'app-user-layout',
  templateUrl: './user-layout.component.html',
  styleUrls: ['./user-layout.component.scss'],
})
export class UserLayoutComponent implements OnInit {
  searchQuery = '';
  results: IUser[] = [];

  constructor(
    private searchService: SearchService,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit(): void {}

  onSearch() {
    this.searchService.onSearch(this.searchQuery);
    this.searchQuery = '';
  }

  get isSearchPage() {
    return this.location.path().includes('search');
  }

  searchResultForAutoComplete(event: any) {
    this.searchQuery = event.query;
    this.searchService
      .searchResultForAutoComplete(this.searchQuery)
      .subscribe((results) => {
        this.results = results.users;
      });
  }

  onSearchResultClick(user: any) {
    event?.stopPropagation();
    console.log(user);
    this.router.navigate(['/profile', user.id]);
    this.searchQuery = '';
  }
}
