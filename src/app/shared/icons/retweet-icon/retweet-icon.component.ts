import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-retweet-icon',
  templateUrl: './retweet-icon.component.html',
})
export class RetweetIconComponent implements OnInit {
  @Input() isActive = true;

  constructor() {}

  ngOnInit(): void {}
}
