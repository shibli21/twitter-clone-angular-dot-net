import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface IRegisterUser {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: Date;
  gender: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  baseUrl = environment.baseUrl + 'auth/';

  constructor(private http: HttpClient, private router: Router) {}

  registerUser({
    confirmPassword,
    dateOfBirth,
    email,
    firstName,
    gender,
    lastName,
    password,
    username,
  }: IRegisterUser) {
    return this.http
      .post(this.baseUrl + 'register', {
        username: username,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
        dateOfBirth: dateOfBirth,
        firstName: firstName,
        lastName: lastName,
        gender: gender,
      })
      .pipe(
        catchError((err) => {
          return throwError(err);
        })
      );
  }
}
