import { IconsModule } from './icons/icons.module';
import { NgPrimeModule } from './ng-prime/ng-prime.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [],
  imports: [CommonModule, NgPrimeModule, IconsModule],
  exports: [NgPrimeModule, IconsModule],
})
export class SharedModule {}
