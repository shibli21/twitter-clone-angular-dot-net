import { UserPagedData } from './model/user-paged-data';
import { Observable, throwError } from 'rxjs';
import { Page } from './model/page';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from './model/user';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private http: HttpClient) {}

  public getPaginatedUsers(page: Page): Observable<UserPagedData<User>> {
    return this.http.get<UserPagedData<User>>(
      `http://noobmasters.learnathon.net/api1/api/user/all?size=${page.size}&page=${page.page}`
    );
  }

  public getUser(id: string): Observable<User> {
    return this.http.get<User>(`http://noobmasters.learnathon.net/api1/api/user/${id}`);
  }

  public updateUser(id: string, email: string, dateOfBirth: Date) {
    return this.http
      .post(`http://noobmasters.learnathon.net/api1/api/user/edit/`, {
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
    return this.http.delete(`http://noobmasters.learnathon.net/api1/api/user/${id}`).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }
}
