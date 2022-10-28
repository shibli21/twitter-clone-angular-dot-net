import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminsListComponent } from './admins-list/admins-list.component';
import { BlockedUsersListComponent } from './blocked-users-list/blocked-users-list.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersListComponent } from './users-list/users-list.component';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'users-list',
    component: UsersListComponent,
  },
  {
    path: 'admins-list',
    component: AdminsListComponent,
  },
  {
    path: 'blocked-users-list',
    component: BlockedUsersListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
