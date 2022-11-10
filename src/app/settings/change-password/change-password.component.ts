import { PasswordService } from './../../core/services/password.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Validation from 'src/app/auth/register/register.component';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit {
  isLoading = false;
  token = '';
  changePasswordForm = new FormGroup(
    {
      password: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    {
      validators: [
        Validation.match('newPassword', 'confirmPassword'),
        Validators.required,
      ],
    }
  );

  constructor(
    private route: ActivatedRoute,
    private passwordService: PasswordService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'];
    });
  }

  onSubmit() {
    if (this.changePasswordForm.invalid) {
      return;
    } else if (
      this.changePasswordForm.value.password &&
      this.changePasswordForm.value.confirmPassword &&
      this.changePasswordForm.value.newPassword
    ) {
      this.isLoading = true;
      this.passwordService
        .changePassword(
          this.changePasswordForm.value.password,
          this.changePasswordForm.value.newPassword,
          this.changePasswordForm.value.confirmPassword
        )
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.toastr.success('Password changed successfully');
          },
          error: (err) => {
            this.isLoading = false;

            if (err.error.field === 'oldPassword') {
              this.toastr.error("Old password doesn't match");
            } else {
              this.toastr.error('Password changed failed');
            }
          },
        });
    }
  }

  get changedPasswordFormControl() {
    return this.changePasswordForm.controls;
  }

  isInvalidTouchedDirty(key: string) {
    let form = this.changePasswordForm as any;

    return (
      (form.controls[key].invalid && form.controls[key].touched) ||
      form.controls[key].dirty
    );
  }
  isTouchedOrDirty(key: string) {
    let form = this.changePasswordForm as any;
    return form.controls[key].touched || form.controls[key].dirty;
  }

  onBlur(event: Event, key: string) {
    let form = this.changePasswordForm as any;
    //make the field touched
    form.controls[key].markAsTouched();
  }
}
