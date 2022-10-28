import { ToastrService } from 'ngx-toastr';
import { EditUserService } from './../../core/services/edit-user.service';
import { AdminService } from './../../core/services/admin.service';
import { Page } from './../users-list/users-list.component';
import { Component, OnInit } from '@angular/core';
import { IUser } from 'src/app/core/models/user.model';

@Component({
  selector: 'app-admins-list',
  templateUrl: './admins-list.component.html',
  styleUrls: ['./admins-list.component.scss'],
})
export class AdminsListComponent implements OnInit {
  page = new Page();
  rows = new Array<IUser>();
  editUserDialog!: boolean;
  editingUser!: IUser;

  constructor(
    private adminService: AdminService,
    private editUserService: EditUserService,
    private toastr: ToastrService
  ) {
    this.page.page = 0;
    this.page.size = 10;
  }

  ngOnInit() {
    this.editUserService.editingDialog.subscribe({
      next: (val) => {
        if (val === false) {
          this.setPage({ offset: this.page.page });
        }
        this.editUserDialog = val;
      },
    });

    this.setPage({ offset: 0 });
  }

  setPage(pageInfo: any) {
    this.page.page = pageInfo.offset;
    this.adminService
      .getAdmins(this.page.page, this.page.size)
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
      this.toastr.success('user blocked');
    });
  }

  showEditUseDialog(user: IUser) {
    this.editingUser = user;
    this.editUserService.editingDialog.next(true);
  }

  removeAdmin(user: IUser) {
    this.adminService.createAdmin(user.id).subscribe(() => {
      this.setPage({ offset: this.page.page });
      this.toastr.success('Admin removed');
    });
  }

  closeEditUserDialog() {
    this.editUserService.editingDialog.next(false);
  }
}
