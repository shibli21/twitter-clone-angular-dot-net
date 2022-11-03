import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile-icon',
  templateUrl: './profile-icon.component.html',
})
export class ProfileIconComponent implements OnInit {
  @Input() isActive = true;

  constructor() {}

  ngOnInit(): void {}
}
