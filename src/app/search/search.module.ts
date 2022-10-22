import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SearchComponent } from './search.component';
import { SearchRoutingModule } from './search-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { SearchUsersComponent } from './search-users/search-users.component';
import { SearchTweetsComponent } from './search-tweets/search-tweets.component';

@NgModule({
  declarations: [SearchComponent, SearchUsersComponent, SearchTweetsComponent],
  imports: [
    CommonModule,
    SearchRoutingModule,
    SharedModule,
    InfiniteScrollModule,
  ],
})
export class SearchModule {}
