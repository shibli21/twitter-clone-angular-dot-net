import { AdminRoutingModule } from './admin-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { EditProfileFormComponent } from './edit-profile-form/edit-profile-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsersListComponent } from './users-list/users-list.component';
import { BlockedUsersListComponent } from './blocked-users-list/blocked-users-list.component';

@NgModule({
  declarations: [DashboardComponent, EditProfileFormComponent, UsersListComponent, BlockedUsersListComponent],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule,
    NgxDatatableModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class AdminModule {}
