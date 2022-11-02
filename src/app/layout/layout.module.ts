import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from './../shared/shared.module';
import { FollowersCardComponent } from './followers-card/followers-card.component';
import { NavComponent } from './nav/nav.component';
import { UserLayoutComponent } from './user-layout/user-layout.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AdminNavComponent } from './admin-nav/admin-nav.component';
import { FormsModule } from '@angular/forms';
import { SideNavComponent } from './side-nav/side-nav.component';
import { BottomNavComponent } from './bottom-nav/bottom-nav.component';

@NgModule({
  declarations: [
    UserLayoutComponent,
    NavComponent,
    FollowersCardComponent,
    AdminLayoutComponent,
    AdminNavComponent,
    SideNavComponent,
    BottomNavComponent,
  ],
  imports: [CommonModule, SharedModule, FormsModule],
})
export class LayoutModule {}
