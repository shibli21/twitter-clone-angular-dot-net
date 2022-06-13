import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './../auth.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private _snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {}

  onSubmit() {
    if (!this.loginForm.valid) {
      return;
    }

    this.isLoading = true;

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe(
      (resData) => {
        this.isLoading = false;
        this.router.navigate(['/']);
      },
      (error) => {
        this.isLoading = false;
        this._snackBar.open(error.error.message, '', {
          duration: 5 * 1000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
      }
    );
  }

  isInvalidTouchedDirty(key: string) {
    let form = this.loginForm;

    return (
      (form.controls[key].invalid && form.controls[key].touched) ||
      form.controls[key].dirty
    );
  }
  isTouchedOrDirty(key: string) {
    let form = this.loginForm;
    return form.controls[key].touched || form.controls[key].dirty;
  }

  get loginFormControl() {
    return this.loginForm.controls;
  }
}
