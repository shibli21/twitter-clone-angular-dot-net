import { IconsModule } from './icons/icons.module';
import { NgPrimeModule } from './ng-prime/ng-prime.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TweetCardComponent } from './tweet/tweet-card/tweet-card.component';

@NgModule({
  declarations: [TweetCardComponent],
  imports: [CommonModule, NgPrimeModule, IconsModule],
  exports: [NgPrimeModule, IconsModule, TweetCardComponent],
})
export class SharedModule {}
