import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'notificationDateFormat',
})
export class NotificationDatetimeFormatPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    return moment(value).format('MMMM Do, YYYY [at] h:mm A');
  }
}
