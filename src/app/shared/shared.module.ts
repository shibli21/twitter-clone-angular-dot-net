import { QuillModule } from 'ngx-quill';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconsModule } from './icons/icons.module';
import { NgPrimeModule } from './ng-prime/ng-prime.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TweetCardComponent } from './tweet/tweet-card/tweet-card.component';
import { NewTweetComponent } from './tweet/new-tweet/new-tweet.component';
import { FollowersListComponent } from './follow/followers-list/followers-list.component';
import { FollowingListComponent } from './follow/following-list/following-list.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { UserCardComponent } from './user-card/user-card.component';
import { NameAndTimeHeaderComponent } from './name-and-time-header/name-and-time-header.component';
import { MomentModule } from 'ngx-moment';
import { TweetCardSkeletonComponent } from './tweet-card-skeleton/tweet-card-skeleton.component';
import { UserCardSkeletonComponent } from './user-card-skeleton/user-card-skeleton.component';

@NgModule({
  declarations: [
    TweetCardComponent,
    NewTweetComponent,
    FollowersListComponent,
    FollowingListComponent,
    SpinnerComponent,
    UserCardComponent,
    NameAndTimeHeaderComponent,
    TweetCardSkeletonComponent,
    UserCardSkeletonComponent,
  ],
  imports: [
    CommonModule,
    NgPrimeModule,
    IconsModule,
    FormsModule,
    ReactiveFormsModule,
    MomentModule,
    QuillModule.forRoot({
      modules: {
        toolbar: [
          [
            'bold',
            'italic',
            'underline',
            'blockquote',
            { header: 1 },
            { header: 2 },
          ],
        ],
      },
    }),
  ],
  exports: [
    NgPrimeModule,
    IconsModule,
    TweetCardComponent,
    NewTweetComponent,
    FollowersListComponent,
    FollowingListComponent,
    SpinnerComponent,
    UserCardComponent,
    NameAndTimeHeaderComponent,
    TweetCardSkeletonComponent,
    UserCardSkeletonComponent,
  ],
})
export class SharedModule {}
