import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, throwError } from 'rxjs';
import { catchError, delay, map, repeat, retry, timeout } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { Page } from './model/page';
import { User } from './model/user';
import { UserPagedData } from './model/user-paged-data';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private http: HttpClient) {}
  baseUrl = environment.baseUrl + '/user/';

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

  public setUserOnline() {
    return this.http
      .post(
        `${this.baseUrl}set-online`,
        {},
        {
          observe: 'response',
        }
      )
      .pipe(
        // timeout(1000),
        catchError((error) => {
          return throwError(error);
        }),
        // retry(),
        delay(1000 * 59),
        repeat()
      );
  }

  public getOnlineUsers() {
    return this.http.get<User[]>(this.baseUrl + 'online');
  }
}
