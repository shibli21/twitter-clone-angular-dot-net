import { Observable } from 'rxjs';
import { AuthService } from './../auth/auth.service';
import { IUser } from 'src/app/core/models/user.model';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  user$ = new Observable<IUser | null>();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user$ = this.authService.userObservable;
  }
}
