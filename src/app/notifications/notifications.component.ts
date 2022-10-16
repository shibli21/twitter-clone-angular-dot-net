import { Component, OnInit } from '@angular/core';

interface INotifications {
  type: string;
  message: string;
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  notifications: INotifications[] = [
    {
      type: 'comment',
      message: 'Nimil commented on your post',
    },
    {
      type: 'heart',
      message: 'Zakaria liked your post',
    },
    {
      type: 'user',
      message: 'Snigdho followed you',
    },
    {
      type: 'share-alt',
      message: 'Masum retweeted your post',
    },
  ];

  constructor() {}

  ngOnInit(): void {}
}
