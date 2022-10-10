import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  value = '';
  birthDate?: Date;
  genders = [
    { name: 'Male' },
    {
      name: 'Female',
    },
    {
      name: 'Other',
    },
  ];

  constructor() {}

  ngOnInit(): void {}
}
