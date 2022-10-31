import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-home-icon',
  templateUrl: './home-icon.component.html',
})
export class HomeIconComponent implements OnInit {
  @Input() isActive = true;

  constructor() {}

  ngOnInit() {}
}
