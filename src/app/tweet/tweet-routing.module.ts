import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { TweetComponent } from './tweet.component';

const routes: Routes = [
  {
    path: ':id',
    component: TweetComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TweetRoutingModule {}
