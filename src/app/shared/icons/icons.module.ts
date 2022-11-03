import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';

import {
  IconCamera,
  IconHeart,
  IconBrandGithub,
  IconHome,
  IconMapPin,
  IconCandle,
  IconLayoutDashboard,
} from 'angular-tabler-icons/icons';

import { HomeIconComponent } from './home-icon/home-icon.component';
import { ProfileIconComponent } from './profile-icon/profile-icon.component';
import { NotificationIconComponent } from './notification-icon/notification-icon.component';
import { SearchIconComponent } from './search-icon/search-icon.component';
import { TweetIconComponent } from './tweet-icon/tweet-icon.component';
import { RetweetIconComponent } from './retweet-icon/retweet-icon.component';
import { CommentIconComponent } from './comment-icon/comment-icon.component';
import { LogoutIconComponent } from './logout-icon/logout-icon.component';
import { SettingsIconComponent } from './settings-icon/settings-icon.component';
import { BlockIconComponent } from './block-icon/block-icon.component';
import { EditProfileIconComponent } from './edit-profile-icon/edit-profile-icon.component';
import { AdminIconComponent } from './admin-icon/admin-icon.component';

const icons = {
  IconCamera,
  IconLayoutDashboard,
  IconHeart,
  IconHome,
  IconBrandGithub,
  IconMapPin,
  IconCandle,
};

@NgModule({
  declarations: [
    HomeIconComponent,
    ProfileIconComponent,
    NotificationIconComponent,
    SearchIconComponent,
    TweetIconComponent,
    RetweetIconComponent,
    CommentIconComponent,
    LogoutIconComponent,
    SettingsIconComponent,
    BlockIconComponent,
    EditProfileIconComponent,
    AdminIconComponent,
  ],
  imports: [CommonModule, TablerIconsModule.pick(icons)],
  exports: [
    TablerIconsModule,
    HomeIconComponent,
    ProfileIconComponent,
    NotificationIconComponent,
    SearchIconComponent,
    TweetIconComponent,
    RetweetIconComponent,
    CommentIconComponent,
    LogoutIconComponent,
    SettingsIconComponent,
    EditProfileIconComponent,
    BlockIconComponent,
    AdminIconComponent,
  ],
})
export class IconsModule {}
