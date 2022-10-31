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
import { LikeReplyRetweetButtonComponent } from './like-reply-retweet-button/like-reply-retweet-button.component';
import { RetweetDialogComponent } from './retweet-dialog/retweet-dialog.component';
import { EditTweetDialogComponent } from './edit-tweet-dialog/edit-tweet-dialog.component';
import { RetweetUndoDialogComponent } from './retweet-undo-dialog/retweet-undo-dialog.component';
import { RetweetCardComponent } from './tweet/retweet-card/retweet-card.component';
import { TopNavComponent } from './top-nav/top-nav.component';
import { SearchDialogComponent } from './search-dialog/search-dialog.component';
import { NewTweetDialogComponent } from './new-tweet-dialog/new-tweet-dialog.component';

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
    LikeReplyRetweetButtonComponent,
    RetweetDialogComponent,
    EditTweetDialogComponent,
    RetweetUndoDialogComponent,
    RetweetCardComponent,
    TopNavComponent,
    SearchDialogComponent,
    NewTweetDialogComponent,
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
    LikeReplyRetweetButtonComponent,
    RetweetDialogComponent,
    EditTweetDialogComponent,
    RetweetUndoDialogComponent,
    RetweetCardComponent,
    TopNavComponent,
    NewTweetDialogComponent,
    SearchDialogComponent,
  ],
})
export class SharedModule {}
