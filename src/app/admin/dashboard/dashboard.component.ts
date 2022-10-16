import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  customers = [
    {
      id: 1000,
      name: 'James Butt',
      country: {
        name: 'Algeria',
        code: 'dz',
      },
      company: 'Benton, John B Jr',
      date: '2015-09-13',
      status: 'unqualified',
      activity: 17,
      representative: {
        name: 'Ioni Bowcher',
        image: 'ionibowcher.png',
      },
    },
    {
      id: 1001,
      name: 'Josephine Darakjy',
      country: {
        name: 'Egypt',
        code: 'eg',
      },
      company: 'Chanay, Jeffrey A Esq',
      date: '2019-02-09',
      status: 'proposal',
      activity: 0,
      representative: {
        name: 'Amy Elsner',
        image: 'amyelsner.png',
      },
    },
  ];

  loading: boolean = false;

  activityValues: number[] = [0, 100];

  constructor() {}

  ngOnInit() {}
}
