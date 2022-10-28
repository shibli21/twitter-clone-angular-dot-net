import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { IUser } from './../../core/models/user.model';
import { AdminService } from './../../core/services/admin.service';
import { Page } from './../users-list/users-list.component';

@Component({
  selector: 'app-blocked-users-list',
  templateUrl: './blocked-users-list.component.html',
  styleUrls: ['./blocked-users-list.component.scss'],
})
export class BlockedUsersListComponent implements OnInit {
  page = new Page();
  rows = new Array<IUser>();
  editUserDialog!: boolean;
  editingUser!: IUser;

  constructor(
    private adminService: AdminService,
    private toastr: ToastrService
  ) {
    this.page.page = 0;
    this.page.size = 10;
  }

  ngOnInit() {
    this.setPage({ offset: 0 });
  }

  setPage(pageInfo: any) {
    this.page.page = pageInfo.offset;
    this.adminService
      .getBlockedUsers(this.page.page, this.page.size)
      .subscribe((pagedData) => {
        this.page.page = pagedData.page;
        this.page.size = pagedData.size;
        this.page.totalElements = pagedData.totalElements;
        this.page.totalPages = pagedData.totalPages;
        this.rows = pagedData.users;
      });
  }

  onBlockUser(id: string) {
    this.adminService.blockUser(id).subscribe(() => {
      this.setPage({ offset: this.page.page });
      this.toastr.success('user unblocked');
    });
  }
}
