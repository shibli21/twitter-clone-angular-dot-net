import { Component } from '@angular/core';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'twitter-clone';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.autoLogin();
  }
}
