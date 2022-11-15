import { PasswordService } from './../../core/services/password.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  isLoading = false;
  forgotPasswordForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  constructor(
    private passwordService: PasswordService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  onSubmit() {
    this.isLoading = true;
    if (this.forgotPasswordForm.invalid) {
      return;
    } else if (this.forgotPasswordForm.value.email) {
      this.passwordService
        .forgotPassword(
          this.forgotPasswordForm.value.email,
          environment.resetPasswordUrl
        )
        .subscribe({
          next: (res) => {
            this.toastr.success(
              'Password reset link sent to your email. Please check spam folder if not found in inbox.'
            );
            this.isLoading = false;
            this.router.navigate(['/login']);
          },
          error: (err) => {
            this.toastr.error(err.error.message);
            this.isLoading = false;
          },
        });
    }
  }

  isInvalidTouchedDirty(key: string) {
    let form = this.forgotPasswordForm as any;

    return (
      (form.controls[key].invalid && form.controls[key].touched) ||
      form.controls[key].dirty
    );
  }
  isTouchedOrDirty(key: string) {
    let form = this.forgotPasswordForm as any;
    return form.controls[key].touched || form.controls[key].dirty;
  }

  onBlur(event: Event, key: string) {
    let form = this.forgotPasswordForm as any;
    form.controls[key].markAsTouched();
  }

  get forgotPasswordFormControl() {
    return this.forgotPasswordForm.controls;
  }
}
