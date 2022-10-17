import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconsModule } from './icons/icons.module';
import { NgPrimeModule } from './ng-prime/ng-prime.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TweetCardComponent } from './tweet/tweet-card/tweet-card.component';
import { NewTweetComponent } from './tweet/new-tweet/new-tweet.component';

@NgModule({
  declarations: [TweetCardComponent, NewTweetComponent],
  imports: [
    CommonModule,
    NgPrimeModule,
    IconsModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [NgPrimeModule, IconsModule, TweetCardComponent, NewTweetComponent],
})
export class SharedModule {}
