import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-notification-icon',
  templateUrl: './notification-icon.component.html',
})
export class NotificationIconComponent implements OnInit {
  @Input() isActive = true;

  constructor() {}

  ngOnInit(): void {}
}
