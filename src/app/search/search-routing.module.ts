import { SearchTweetsComponent } from './search-tweets/search-tweets.component';
import { SearchUsersComponent } from './search-users/search-users.component';
import { SearchComponent } from './search.component';
import { UserLayoutComponent } from './../layout/user-layout/user-layout.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'search-users',
    component: SearchUsersComponent,
  },
  {
    path: 'search-tweets',
    component: SearchTweetsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchRoutingModule {}
