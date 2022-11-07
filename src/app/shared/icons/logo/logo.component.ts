import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss'],
})
export class LogoComponent implements OnInit {
  @Input() fill = 'fill-indigo-700';
  @Input() size = 2.5;

  constructor() {}

  ngOnInit(): void {}

  get sizeStyle() {
    return `width: ${this.size}rem; height: ${this.size}rem`;
  }
}
