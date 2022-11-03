import { BlockUserCardComponent } from './block-list/block-user-card/block-user-card.component';
import { SettingsComponent } from './settings.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { BlockListComponent } from './block-list/block-list.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './../shared/shared.module';
import { SettingsRoutingModule } from './settings-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    SettingsComponent,
    EditProfileComponent,
    BlockListComponent,
    BlockUserCardComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    SettingsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    InfiniteScrollModule,
  ],
})
export class SettingsModule {}
