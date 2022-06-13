import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';

@NgModule({
  exports: [
    MatSnackBarModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
  ],
})
export class MaterialModule {}
