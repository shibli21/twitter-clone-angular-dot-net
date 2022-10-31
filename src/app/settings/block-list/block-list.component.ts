import { ActivatedRoute } from '@angular/router';
import { BlockService } from '../../core/services/block.service';
import { Component, OnInit } from '@angular/core';
import {
  IPaginatedUsers,
  PaginatedUsers,
} from 'src/app/core/models/user.model';

@Component({
  selector: 'app-block-list',
  templateUrl: './block-list.component.html',
  styleUrls: ['./block-list.component.scss'],
})
export class BlockListComponent implements OnInit {
  blockedUsers!: IPaginatedUsers | null;
  isLoading = false;

  constructor(
    private blockService: BlockService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.blockService.blockedUsers.next(new PaginatedUsers());

      this.blockService.isLoadingBlockedUsers.subscribe((isLoading) => {
        this.isLoading = isLoading;
      });

      this.blockService.blockedUsers.subscribe((IPaginatedUsers) => {
        this.blockedUsers = IPaginatedUsers;
      });

      this.blockService.getBlockedUsers(this.blockedUsers?.page);
    });
  }

  loadMoreUser() {
    this.blockService.loadMoreBlockedUsers();
  }
}
