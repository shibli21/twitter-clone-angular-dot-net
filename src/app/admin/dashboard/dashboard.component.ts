import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { User } from './../../core/models/user.model';
import { AdminService } from './../../core/services/admin.service';
import { EditUserService } from './../../core/services/edit-user.service';

class Page {
  size: number = 0;
  totalElements: number = 0;
  totalPages: number = 0;
  lastPage: number = 0;
  page: number = 0;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  page = new Page();
  rows = new Array<User>();
  editUserDialog!: boolean;
  editingUser!: User;

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
      next: (val) => (this.editUserDialog = val),
    });

    this.setPage({ offset: 0 });
  }

  setPage(pageInfo: any) {
    this.page.page = pageInfo.offset;
    this.adminService
      .getUsers(this.page.page, this.page.size)
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

  showEditUseDialog(user: User) {
    this.editingUser = user;

    this.editUserService.editingDialog.next(true);
  }
}
