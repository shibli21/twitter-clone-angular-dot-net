import { ITweet } from './../../../core/models/tweet.model';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-retweet-card',
  templateUrl: './retweet-card.component.html',
  styleUrls: ['./retweet-card.component.scss'],
})
export class RetweetCardComponent implements OnInit {
  @Input() tweet!: ITweet;

  constructor() {}

  ngOnInit(): void {}
}
