import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NotificationsRoutingModule } from './notifications-routing.module';
import { NotificationsComponent } from './notifications.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [NotificationsComponent],
  imports: [
    CommonModule,
    NotificationsRoutingModule,
    InfiniteScrollModule,
    SharedModule,
  ],
})
export class NotificationsModule {}
