import { NgModule } from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';

import {
  IconCamera,
  IconHeart,
  IconBrandGithub,
  IconHome,
  IconMapPin,
} from 'angular-tabler-icons/icons';

const icons = {
  IconCamera,
  IconHeart,
  IconHome,
  IconBrandGithub,
  IconMapPin,
};

@NgModule({
  imports: [TablerIconsModule.pick(icons)],
  exports: [TablerIconsModule],
})
export class IconsModule {}
