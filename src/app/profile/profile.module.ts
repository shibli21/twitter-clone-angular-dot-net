import { MediumZoomDirective } from './../core/directive/mediumZoom.directive';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './../shared/shared.module';
import { ProfileRoutingModule } from './profile-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';
import { FollowListComponent } from './follow-list/follow-list.component';
import { FollowersListComponent } from './follow-list/followers-list/followers-list.component';
import { FollowingListComponent } from './follow-list/following-list/following-list.component';

@NgModule({
  declarations: [
    ProfileComponent,
    FollowListComponent,
    FollowersListComponent,
    FollowingListComponent,
    MediumZoomDirective,
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    InfiniteScrollModule,
  ],
})
export class ProfileModule {}
