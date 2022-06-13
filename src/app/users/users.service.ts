import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Page } from './model/page';
import { User } from './model/user';
import { UserPagedData } from './model/user-paged-data';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private http: HttpClient) {}
  baseUrl = 'http://noobmasters.learnathon.net/api1/api/user/';

  public getPaginatedUsers(page: Page): Observable<UserPagedData<User>> {
    return this.http.get<UserPagedData<User>>(
      this.baseUrl + `all?size=${page.size}&page=${page.page}`
    );
  }

  public getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}${id}`);
  }

  public updateUser(id: string, email: string, dateOfBirth: Date) {
    return this.http
      .post(`${this.baseUrl}/edit/`, {
        id: id,
        email: email,
        dateOfBirth: dateOfBirth,
      })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  public deleteUser(id: string) {
    return this.http.delete(`${this.baseUrl}${id}`).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }
}
