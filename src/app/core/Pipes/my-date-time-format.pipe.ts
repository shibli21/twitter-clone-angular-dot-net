import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'dateTimeFormat',
})
export class MyDatetimeFormatPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    return moment(value).calendar(null, {
      sameDay: 'LT',
      nextDay: '[Tomorrow]',
      nextWeek: 'dddd',
      lastDay: '[Yesterday]',
      lastWeek: '[Last] dddd',
      sameElse: 'MMM DD',
    });
  }
}
