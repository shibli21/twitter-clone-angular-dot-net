import { FollowService } from './follow.service';
import { AuthService } from './../../auth/auth.service';
import { catchError, throwError, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { IUser } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  user = new BehaviorSubject<IUser | null>(null);
  isUserLoading = new BehaviorSubject<boolean>(false);

  baseUrl = environment.baseUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private followService: FollowService
  ) {}

  getUserById(id: string) {
    if (id === this.user.value?.id) {
      return;
    } else {
      this.isUserLoading.next(true);

      if (id === this.authService.userId()) {
        return this.authService.currentUser().subscribe({
          next: (res) => {
            this.isUserLoading.next(false);
            this.user.next(res);
          },
          error: (err) => {
            this.isUserLoading.next(false);
            // this.router.navigate(['/not-found']);
          },
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
              // this.router.navigate(['/not-found']);
            },
          });
      }
    }
  }
}
