import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthService } from './../auth.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ILoginUser } from '../Models/user.model';

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
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    console.log(this.authService.user.value);
  }

  onSubmit() {
    if (!this.loginForm.valid) {
      return;
    }

    this.isLoading = true;

    const { email, password } = this.loginForm.value as ILoginUser;

    this.authService.loginUser({ email, password }).subscribe({
      next: (loginResponse) => {
        this.isLoading = false;

        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isLoading = false;
        this.toastr.error(error.error.message);
      },
    });
  }

  isInvalidTouchedDirty(key: string) {
    let form = this.loginForm as any;

    return (
      (form.controls[key].invalid && form.controls[key].touched) ||
      form.controls[key].dirty
    );
  }
  isTouchedOrDirty(key: string) {
    let form = this.loginForm as any;
    return form.controls[key].touched || form.controls[key].dirty;
  }

  onBlur(event: Event, key: string) {
    let form = this.loginForm as any;
    //make the field touched
    form.controls[key].markAsTouched();
  }

  get loginFormControl() {
    return this.loginForm.controls;
  }
}
