import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Page } from './model/page';
import { User } from './model/user';
import { UsersService } from './users.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UsersComponent implements OnInit {
  page = new Page();
  rows = new Array<User>();

  constructor(
    private usersService: UsersService,
    private _snackBar: MatSnackBar
  ) {
    this.page.page = 0;
    this.page.size = 4;
  }

  ngOnInit() {
    this.setPage({ offset: 0 });
  }

  setPage(pageInfo: any) {
    this.page.page = pageInfo.offset;
    this.usersService.getPaginatedUsers(this.page).subscribe((pagedData) => {
      this.page.page = pagedData.page;
      this.page.size = pagedData.size;
      this.page.totalElements = pagedData.totalElements;
      this.page.totalPages = pagedData.totalPages;
      this.rows = pagedData.users;
    });
  }

  onDeleteUser(id: string) {
    this.usersService.deleteUser(id).subscribe(() => {
      this.setPage({ offset: this.page.page });
      this._snackBar.open('User deleted successfully', '', {
        duration: 5 * 1000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      });
    });
  }
}
