import { ToastrService } from 'ngx-toastr';
import { BlockService } from './../../core/services/block.service';
import { Component, OnInit } from '@angular/core';
import { PaginatedUsers } from 'src/app/core/models/user.model';

@Component({
  selector: 'app-block-list',
  templateUrl: './block-list.component.html',
  styleUrls: ['./block-list.component.scss'],
})
export class BlockListComponent implements OnInit {
  blockedUsers: PaginatedUsers = {
    users: [],
    lastPage: 0,
    page: 0,
    size: 0,
    totalElements: 0,
    totalPages: 0,
  };
  isLoading = false;

  constructor(
    private blockService: BlockService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.blockService.getBlockedUsers().subscribe((res) => {
      this.blockedUsers = res;
    });
  }

  loadMoreUser() {
    this.isLoading = true;
    if (this.blockedUsers.page < this.blockedUsers.lastPage) {
      this.blockedUsers.page++;
      this.blockService
        .getBlockedUsers(this.blockedUsers.page)
        .subscribe((res) => {
          this.isLoading = false;
          this.blockedUsers.users = this.blockedUsers.users.concat(res.users);
        });
    } else {
    }
  }

  unblockUser(userId: string) {
    this.blockService.blockUserByUser(userId).subscribe({
      next: (res) => {
        this.toastr.success('User unblocked successfully');
        this.blockedUsers.users = this.blockedUsers.users.filter(
          (user) => user.id !== userId
        );
      },
      error: (err) => {},
    });
  }
}
