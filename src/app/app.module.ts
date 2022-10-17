import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './auth/auth.interceptor.service';
import { AuthService } from './auth/auth.service';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { MaterialModule } from './modules/material.module';
import { NavComponent } from './nav/nav.component';
import { ProfileComponent } from './profile/profile.component';
import { LoadingSpinnerComponent } from './shared/loading-spinner/loading-spinner.component';
import { UserEditComponent } from './users/user-edit/user-edit.component';
import { UsersComponent } from './users/users.component';
import { HomeComponent } from './home/home.component';
import { ChatBoxComponent } from './chat-box/chat-box.component';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    RegisterComponent,
    LoginComponent,
    LoadingSpinnerComponent,
    UsersComponent,
    UserEditComponent,
    ProfileComponent,
    HomeComponent,
    ChatBoxComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgxDatatableModule,
    RouterModule,
    MaterialModule,
  ],
  providers: [
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
