import { ToastrService } from 'ngx-toastr';
import { BlockService } from './../../../core/services/block.service';
import { IUser } from 'src/app/core/models/user.model';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-block-user-card',
  templateUrl: './block-user-card.component.html',
  styleUrls: ['./block-user-card.component.scss'],
})
export class BlockUserCardComponent implements OnInit {
  @Input() user!: IUser;
  isLoading = false;
  isUnblocking = false;

  constructor(
    private blockService: BlockService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {}

  loadMoreUser() {}

  unblockUser(userId: string) {
    this.isUnblocking = true;
    this.blockService.blockUserByUser(userId).subscribe({
      next: () => {
        this.toastr.success('User unblocked successfully');
        const oldUsers = this.blockService.blockedUsers.value;

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
