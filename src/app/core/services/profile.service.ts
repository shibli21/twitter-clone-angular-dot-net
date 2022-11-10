import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IUser } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private user = new BehaviorSubject<IUser | null>(null);
  public userObservable = this.user.asObservable();
  private isUserLoading = new BehaviorSubject<boolean>(false);
  public isUserLoadingObservable = this.isUserLoading.asObservable();

  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getUserById(id: string) {
    if (id === this.user.value?.id) {
      return;
    } else {
      this.isUserLoading.next(true);

      if (id === this.authService.userId()) {
        return this.authService
          .currentUser()
          .subscribe({
            next: (res) => {
              this.isUserLoading.next(false);
              this.user.next(res);
            },
            error: (err) => {
              this.isUserLoading.next(false);
              this.user.next(null);
            },
          })
          .add(() => {
            this.isUserLoading.next(false);
          });
      } else {
        return this.http
          .get<IUser>(this.baseUrl + 'users/' + id)
          .pipe(
            catchError((err) => {
              return throwError(() => err);
            })
          )
          .subscribe({
            next: (res) => {
              this.isUserLoading.next(false);
              this.user.next(res);
            },
            error: (err) => {
              this.isUserLoading.next(false);
              this.user.next(null);
            },
          })
          .add(() => {
            this.isUserLoading.next(false);
          });
      }
    }
  }

  setUser(user: IUser) {
    this.user.next(user);
  }
}
