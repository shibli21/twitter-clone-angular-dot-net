import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from './../shared/shared.module';
import { FollowersCardComponent } from './followers-card/followers-card.component';
import { NavComponent } from './nav/nav.component';
import { ProfileCardComponent } from './profile-card/profile-card.component';
import { UserLayoutComponent } from './user-layout/user-layout.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AdminNavComponent } from './admin-nav/admin-nav.component';
import { FormsModule } from '@angular/forms';
import { MyFollowersListComponent } from './profile-card/my-followers-list/my-followers-list.component';
import { MyFollowingListComponent } from './profile-card/my-following-list/my-following-list.component';

@NgModule({
  declarations: [
    UserLayoutComponent,
    NavComponent,
    ProfileCardComponent,
    FollowersCardComponent,
    AdminLayoutComponent,
    AdminNavComponent,
    MyFollowersListComponent,
    MyFollowingListComponent,
  ],
  imports: [CommonModule, SharedModule, FormsModule],
})
export class LayoutModule {}
