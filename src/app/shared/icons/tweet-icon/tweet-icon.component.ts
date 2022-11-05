import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tweet-icon',
  templateUrl: './tweet-icon.component.html',
})
export class TweetIconComponent implements OnInit {
  @Input() fillClass = '';

  constructor() {}

  ngOnInit(): void {}
}
