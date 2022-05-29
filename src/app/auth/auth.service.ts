import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';

export interface RegisterResponseData {
  username: string;
  email: string;
  confirmPassword: string;
  password: string;
  dateOfBirth: Date;
}

@Injectable()
export class AuthService {
  constructor(private http: HttpClient) {}

  register(
    username: string,
    email: string,
    password: string,
    confirmPassword: string,
    dateOfBirth: Date
  ) {
    return this.http
      .post('http://noobmasters.learnathon.net/api1/api/user/register', {
        username: username,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
        dateOfBirth: dateOfBirth,
      })
      .pipe(
        catchError((error) => {
          console.log(error);
          return throwError(error);
        })
      );
  }
}
