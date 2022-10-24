import { User } from './../../core/models/tweet.model';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-name-and-time-header',
  templateUrl: './name-and-time-header.component.html',
  styleUrls: ['./name-and-time-header.component.scss'],
})
export class NameAndTimeHeaderComponent implements OnInit {
  @Input() user!: User;
  @Input() date: Date | undefined;

  ngOnInit(): void {}
}
