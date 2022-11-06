import { Location } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { Observable, Subject, takeUntil } from 'rxjs';
import { IUser } from 'src/app/core/models/user.model';
import { AuthService } from './../../auth/auth.service';
import { NavService } from './../../core/services/nav.service';
import { SearchService } from './../../core/services/search.service';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss'],
  providers: [ConfirmationService],
})
export class TopNavComponent implements OnInit, OnDestroy {
  @Input() title: string = '';
  @Input() showBackButton = true;
  user$ = new Observable<IUser | null>();
  sidenavDisplay = false;
  searchQuery = '';

  private unsubscribe$: Subject<any> = new Subject<any>();

  constructor(
    private location: Location,
    private authService: AuthService,
    private searchService: SearchService,
    private confirmationService: ConfirmationService,
    private navService: NavService
  ) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    if (this.location.path().includes('search/search-users')) {
      this.searchService.searchQueryObservable
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((query) => {
          this.searchQuery = query;
        });
    } else {
      this.searchService.tweetSearchQueryObservable
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((query) => {
          this.searchQuery = query;
        });
    }

    this.user$ = this.authService.userObservable;
  }

  goBack() {
    this.location.back();
  }

  toggleSidebar() {
    this.sidenavDisplay = !this.sidenavDisplay;
  }

  navigateToHomeAndRefresh() {
    this.navService.refreshHome();
    this.sidenavDisplay = !this.sidenavDisplay;
  }

  navigateToProfileAndRefresh() {
    this.navService.refreshProfile();
    this.sidenavDisplay = !this.sidenavDisplay;
  }

  logout() {
    this.sidenavDisplay = false;
    this.confirmationService.confirm({
      key: 'top-logout',
      message: 'Are you sure that you want to logout?',
      accept: () => {
        this.authService.logout();
      },
    });
  }

  isAdmin() {
    return this.authService.currentUserValue()?.role === 'admin';
  }

  onSearch() {
    this.searchService.onSearch(this.searchQuery);
  }

  isSearchPage() {
    return this.location.path().includes('search');
  }
}
