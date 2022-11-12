import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings-icon',
  templateUrl: './settings-icon.component.html',
  styleUrls: ['./settings-icon.component.scss'],
})
export class SettingsIconComponent implements OnInit {
  @Input() isActive = false;

  constructor() {}

  ngOnInit(): void {}
}
