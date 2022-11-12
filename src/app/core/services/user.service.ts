import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IUser } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getUserById(id: string) {
    return this.http.get<IUser>(this.baseUrl + 'users/' + id).pipe(
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }

  updateUser(user: FormData) {
    return this.http.put<IUser>(this.baseUrl + 'users/edit', user).pipe(
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }

  getYouMayFollow() {
    return this.http
      .get<IUser[]>(this.baseUrl + 'users/may-follow' + `?size=${8}`)
      .pipe(
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }

  getAuthors() {
    return this.http.get<IUser[]>(this.baseUrl + 'users/follow-author').pipe(
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }
}
