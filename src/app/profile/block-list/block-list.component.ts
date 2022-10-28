import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BlockService } from './../../core/services/block.service';
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
  isUnblocking = false;

  constructor(
    private blockService: BlockService,
    private toastr: ToastrService,
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

  unblockUser(userId: string) {
    this.isUnblocking = true;
    this.blockService.blockUserByUser(userId).subscribe({
      next: (res) => {
        this.toastr.success('User unblocked successfully');
        const oldUsers = this.blockedUsers;

        if (oldUsers) {
          this.blockService.blockedUsers.next({
            ...oldUsers,
            users: oldUsers.users?.filter((user) => user.id !== userId),
          });
        }
        this.isUnblocking = false;
      },
      error: (err) => {
        this.toastr.error(err.error.message);
        this.isUnblocking = false;
      },
    });
  }
}
