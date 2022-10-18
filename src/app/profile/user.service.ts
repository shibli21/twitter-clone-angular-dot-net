import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { User } from '../auth/Models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient, private router: Router) {}

  getUserById(id: string) {
    return this.http.get<User>(this.baseUrl + 'users/' + id).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  updateUser(user: User) {
    return this.http.put<User>(this.baseUrl + 'users/edit', user).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }
}
