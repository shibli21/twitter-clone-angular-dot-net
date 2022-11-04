import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MomentModule } from 'ngx-moment';
import { QuillModule } from 'ngx-quill';
import { EditTweetDialogComponent } from './edit-tweet-dialog/edit-tweet-dialog.component';
import { IconsModule } from './icons/icons.module';
import { LikeReplyRetweetButtonComponent } from './like-reply-retweet-button/like-reply-retweet-button.component';
import { NameAndTimeHeaderComponent } from './name-and-time-header/name-and-time-header.component';
import { NewTweetDialogComponent } from './new-tweet-dialog/new-tweet-dialog.component';
import { NgPrimeModule } from './ng-prime/ng-prime.module';
import { RetweetDialogComponent } from './retweet-dialog/retweet-dialog.component';
import { RetweetUndoDialogComponent } from './retweet-undo-dialog/retweet-undo-dialog.component';
import { SearchDialogComponent } from './search-dialog/search-dialog.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { TopNavComponent } from './top-nav/top-nav.component';
import { TweetCardSkeletonComponent } from './tweet-card-skeleton/tweet-card-skeleton.component';
import { NewTweetComponent } from './tweet/new-tweet/new-tweet.component';
import { RetweetCardComponent } from './tweet/retweet-card/retweet-card.component';
import { TweetCardComponent } from './tweet/tweet-card/tweet-card.component';
import { UserCardSkeletonComponent } from './user-card-skeleton/user-card-skeleton.component';
import { UserCardComponent } from './user-card/user-card.component';

@NgModule({
  declarations: [
    TweetCardComponent,
    NewTweetComponent,
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
    ConfirmationDialogComponent,
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
        toolbar: [['bold', 'italic', { header: 1 }, { header: 2 }]],
      },
    }),
  ],
  exports: [
    NgPrimeModule,
    IconsModule,
    TweetCardComponent,
    NewTweetComponent,
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
    ConfirmationDialogComponent,
  ],
})
export class SharedModule {}
