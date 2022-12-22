import { Subject, takeUntil } from 'rxjs';
import { Location } from '@angular/common';
import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { AutoComplete } from 'primeng/autocomplete';
import { ITweet } from './../../core/models/tweet.model';
import { IUser } from './../../core/models/user.model';
import { SearchService } from './../../core/services/search.service';

@Component({
  selector: 'app-autocomplete-input',
  templateUrl: './autocomplete-input.component.html',
  styleUrls: ['./autocomplete-input.component.scss'],
})
export class AutocompleteInputComponent implements OnInit {
  searchQuery = '';
  results: IUser[] | string[] = [];
  @ViewChild('autocomplete') autocomplete!: AutoComplete;

  constructor(
    private searchService: SearchService,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit(): void {}

  onSearch() {
    this.searchService.onSearch(this.searchQuery);
    this.autocomplete.hide();
  }

  get isSearchPage() {
    return this.location.path().includes('search');
  }

  searchResultForAutoComplete(event: any) {
    this.searchQuery = event.query;
    this.searchService
      .searchResultForAutoComplete(this.searchQuery)
      .subscribe((results: any) => {
        if (this.searchQuery.startsWith('#')) {
          this.results = results.hashTags;
        } else {
          this.results = results.users;
        }
      });
  }

  onSearchResultClick(user: any) {
    event?.stopPropagation();
    this.searchService.setIsSearchDialogOpen(false);

    if (user.userName) {
      this.router.navigate(['/profile', user.id]);
    } else {
      this.onSearch();
      this.autocomplete.inputEL.nativeElement.value = user;
    }
  }
}
