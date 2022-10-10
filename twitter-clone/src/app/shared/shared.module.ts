import { NgPrimeModule } from './ng-prime/ng-prime.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [],
  imports: [CommonModule, NgPrimeModule],
  exports: [NgPrimeModule],
})
export class SharedModule {}
