import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconsModule } from './icons/icons.module';
import { NgPrimeModule } from './ng-prime/ng-prime.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TweetCardComponent } from './tweet/tweet-card/tweet-card.component';
import { NewTweetComponent } from './tweet/new-tweet/new-tweet.component';
import { FollowersListComponent } from './follow/followers-list/followers-list.component';
import { FollowingListComponent } from './follow/following-list/following-list.component';

@NgModule({
  declarations: [
    TweetCardComponent,
    NewTweetComponent,
    FollowersListComponent,
    FollowingListComponent,
  ],
  imports: [
    CommonModule,
    NgPrimeModule,
    IconsModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    NgPrimeModule,
    IconsModule,
    TweetCardComponent,
    NewTweetComponent,
    FollowersListComponent,
    FollowingListComponent,
  ],
})
export class SharedModule {}
