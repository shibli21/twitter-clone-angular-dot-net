import { PaginatedUsers } from 'src/app/core/models/user.model';
import { SearchService } from './../core/services/search.service';
import { Component, OnInit } from '@angular/core';
import { User } from '../core/models/user.model';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
