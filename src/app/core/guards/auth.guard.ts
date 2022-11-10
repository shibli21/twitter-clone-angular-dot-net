import { AuthService } from './../services/auth.service';
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { map, Observable, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.authService.userObservable.pipe(
      take(1),
      map((user) => {
        const isAuth = !!user;
        if (isAuth) {
          if (
            route.data['roles'] &&
            route.data['roles'].indexOf(user.role) === -1
          ) {
            if (user.role === 'admin') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/']);
            }
            return true;
          }
          return true;
        }
        return this.router.createUrlTree(['/login']);
      })
    );
  }
}

// import { ILoginResponse } from './../models/user.model';
// import { AuthService } from './../services/auth.service';
// import { Injectable } from '@angular/core';
// import {
//   ActivatedRouteSnapshot,
//   CanActivate,
//   Router,
//   RouterStateSnapshot,
//   UrlTree,
// } from '@angular/router';
// import { map, Observable, take } from 'rxjs';

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthGuard implements CanActivate {
//   constructor(private authService: AuthService, private router: Router) {}

//   canActivate(
//     route: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot
//   ):
//     | Observable<boolean | UrlTree>
//     | Promise<boolean | UrlTree>
//     | boolean
//     | UrlTree {
//     const userAuthData = localStorage.getItem('userData');

//     if (!userAuthData) {
//       return false;
//     } else {
//       const { refreshTokenExpiresAt, role } = JSON.parse(
//         userAuthData
//       ) as ILoginResponse;

//       // refresh token expired - redirect to login

//       if (new Date(refreshTokenExpiresAt) < new Date()) {
//         this.router.navigate(['/login']);
//         return false;
//       }

//       if (route.data['roles'] && route.data['roles'].indexOf(role) === -1) {
//         if (role === 'admin') {
//           this.router.navigate(['/admin']);
//         } else {
//           this.router.navigate(['/']);
//         }
//         return true;
//       }
//       return true;
//     }
//   }
// }
