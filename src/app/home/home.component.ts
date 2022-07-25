import { User } from './../users/model/user';
import { UsersService } from './../users/users.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  onlineUsers?: User[];

  constructor(private usersService: UsersService) {}

  ngOnInit() {
    this.usersService.getOnlineUsers().subscribe((users) => {
      this.onlineUsers = users;
    });
    console.log(this.onlineUsers);
    this.usersService.setUserOnline().subscribe((data) => {
      console.log(data);
    });
  }
}
