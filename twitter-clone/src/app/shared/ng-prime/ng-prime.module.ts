import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MenubarModule } from 'primeng/menubar';
import { PasswordModule } from 'primeng/password';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { TabViewModule } from 'primeng/tabview';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';

import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  exports: [
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    CalendarModule,
    MenubarModule,
    DropdownModule,
    DialogModule,
    DividerModule,
    AvatarModule,
    TieredMenuModule,
    TabViewModule,
    InputTextareaModule,
    TableModule,
    ToastModule,
    ProgressBarModule,
  ],
})
export class NgPrimeModule {}
