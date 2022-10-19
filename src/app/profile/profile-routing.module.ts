import { BlockListComponent } from './block-list/block-list.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { ProfileComponent } from './profile.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: ':userId',
    component: ProfileComponent,
  },
  {
    path: 'edit/:userId',
    component: EditProfileComponent,
  },
  {
    path: 'block/users',
    component: BlockListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileRoutingModule {}
