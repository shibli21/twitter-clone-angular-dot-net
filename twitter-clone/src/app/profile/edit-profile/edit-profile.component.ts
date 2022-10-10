import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit {
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
