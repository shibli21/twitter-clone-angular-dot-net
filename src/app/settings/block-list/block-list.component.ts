import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { IPaginatedUsers } from 'src/app/core/models/user.model';
import { BlockService } from '../../core/services/block.service';

@Component({
  selector: 'app-block-list',
  templateUrl: './block-list.component.html',
  styleUrls: ['./block-list.component.scss'],
})
export class BlockListComponent implements OnInit, OnDestroy {
  blockedUsers: IPaginatedUsers | null = null;
  isLoading = false;

  private unsubscribe$: Subject<any> = new Subject<any>();

  constructor(private blockService: BlockService) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete();
    this.blockService.clearBlockedUsers();
  }

  ngOnInit(): void {
    this.blockService.isLoadingBlockedUsersObservable
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((isLoading) => {
        this.isLoading = isLoading;
      });

    this.blockService.blockedUsersObservable
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((paginatedUsers) => {
        this.blockedUsers = paginatedUsers;
      });

    this.blockService.getBlockedUsers(this.blockedUsers?.page);
  }

  loadMoreUser() {
    this.blockService.loadMoreBlockedUsers();
  }
}
