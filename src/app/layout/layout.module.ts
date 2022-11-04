import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from './../shared/shared.module';
import { FollowersCardComponent } from './followers-card/followers-card.component';
import { UserLayoutComponent } from './user-layout/user-layout.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { FormsModule } from '@angular/forms';
import { SideNavComponent } from './side-nav/side-nav.component';
import { BottomNavComponent } from './bottom-nav/bottom-nav.component';
import { AdminSideNavComponent } from './admin-side-nav/admin-side-nav.component';
import { AdminTopNavComponent } from './admin-top-nav/admin-top-nav.component';

@NgModule({
  declarations: [
    UserLayoutComponent,
    FollowersCardComponent,
    AdminLayoutComponent,
    SideNavComponent,
    BottomNavComponent,
    AdminSideNavComponent,
    AdminTopNavComponent,
  ],
  imports: [CommonModule, SharedModule, FormsModule],
})
export class LayoutModule {}
