import { QuillModule } from 'ngx-quill';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { TweetRoutingModule } from './tweet-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TweetComponent } from './tweet.component';
import { SharedModule } from '../shared/shared.module';
import { TweetCommentComponent } from './tweet-comment/tweet-comment.component';
import { NewCommentComponent } from './new-comment/new-comment.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [TweetComponent, TweetCommentComponent, NewCommentComponent],
  imports: [
    CommonModule,
    TweetRoutingModule,
    SharedModule,
    FormsModule,
    InfiniteScrollModule,
    QuillModule,
  ],
})
export class TweetModule {}
