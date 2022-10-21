import { ToastrService } from 'ngx-toastr';
import { PasswordService } from './../password.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import Validation from '../register/register.component';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  isLoading = false;
  token = '';
  resetPasswordForm = new FormGroup(
    {
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/),
        Validators.minLength(6),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    {
      validators: [
        Validation.match('password', 'confirmPassword'),
        Validators.required,
      ],
    }
  );

  constructor(
    private route: ActivatedRoute,
    private passwordService: PasswordService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'];
    });
  }

  onSubmit() {
    if (this.resetPasswordForm.invalid) {
      return;
    } else if (
      this.resetPasswordForm.value.password &&
      this.resetPasswordForm.value.confirmPassword
    ) {
      this.isLoading = true;
      this.passwordService
        .resetPassword(
          this.resetPasswordForm.value.password,
          this.resetPasswordForm.value.confirmPassword,
          this.token
        )
        .subscribe({
          next: (res) => {
            this.isLoading = false;
            this.toastr.success('Password reset successfully');
            this.router.navigate(['/login']);
          },
          error: (err) => {
            this.isLoading = false;
            this.toastr.error(err.error.message);
          },
        });
    }
  }

  get resetPasswordFormControl() {
    return this.resetPasswordForm.controls;
  }

  isInvalidTouchedDirty(key: string) {
    let form = this.resetPasswordForm as any;

    return (
      (form.controls[key].invalid && form.controls[key].touched) ||
      form.controls[key].dirty
    );
  }
  isTouchedOrDirty(key: string) {
    let form = this.resetPasswordForm as any;
    return form.controls[key].touched || form.controls[key].dirty;
  }

  onBlur(event: Event, key: string) {
    let form = this.resetPasswordForm as any;
    //make the field touched
    form.controls[key].markAsTouched();
  }
}
