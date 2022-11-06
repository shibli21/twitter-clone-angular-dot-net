import { ToastrService } from 'ngx-toastr';
import { EditUserService } from './../../core/services/edit-user.service';
import { AdminService } from './../../core/services/admin.service';
import { Page } from './../users-list/users-list.component';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { IUser } from 'src/app/core/models/user.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-admins-list',
  templateUrl: './admins-list.component.html',
  styleUrls: ['./admins-list.component.scss'],
})
export class AdminsListComponent implements OnInit, OnDestroy {
  page = new Page();
  rows = new Array<IUser>();
  editUserDialog!: boolean;
  editingUser!: IUser;
  private unsubscribe$: Subject<any> = new Subject<any>();

  constructor(
    private adminService: AdminService,
    private editUserService: EditUserService,
    private toastr: ToastrService
  ) {
    this.page.page = 0;
    this.page.size = 10;
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete();
  }

  ngOnInit() {
    this.editUserService.isEditingDialogObservable
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
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
    this.editUserService.setEditingDialog(true);
  }

  removeAdmin(user: IUser) {
    this.adminService.createAdmin(user.id).subscribe(() => {
      this.setPage({ offset: this.page.page });
      this.toastr.success('Admin removed');
    });
  }

  closeEditUserDialog() {
    this.editUserService.setEditingDialog(false);
  }
}
