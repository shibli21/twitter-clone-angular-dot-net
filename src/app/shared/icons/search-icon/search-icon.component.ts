import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-search-icon',
  templateUrl: './search-icon.component.html',
})
export class SearchIconComponent implements OnInit {
  @Input() isActive = true;

  constructor() {}

  ngOnInit(): void {}
}
