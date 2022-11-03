import { ProfileComponent } from './profile.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FollowListComponent } from './follow-list/follow-list.component';

const routes: Routes = [
  {
    path: ':userId',
    component: ProfileComponent,
  },
  {
    path: 'follow-list/:userId',
    component: FollowListComponent,
    data: {
      user: null,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileRoutingModule {}
