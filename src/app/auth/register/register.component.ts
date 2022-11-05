import { IRegisterUser } from '../../core/models/user.model';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { AuthService } from '../auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  genders = [
    { name: 'Male', value: 'male' },
    { name: 'Female', value: 'female' },
  ];

  registerUserForm = new FormGroup(
    {
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        Validation.validUsername,
      ]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      gender: new FormControl('male', [Validators.required]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/),
        Validators.minLength(6),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
      dateOfBirth: new FormControl(new Date(), [Validators.required]),
    },
    {
      validators: [
        Validation.match('password', 'confirmPassword'),
        Validators.required,
      ],
    }
  );
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {}

  onSubmit() {
    console.log(this.registerUserForm);

    this.registerUserForm.markAllAsTouched();
    if (!this.registerUserForm.valid) {
      return;
    }

    this.isLoading = true;

    this.authService
      .registerUser(this.registerUserForm.value as IRegisterUser)
      .subscribe({
        next: () => {
          this.isLoading = false;

          this.toastr.success('User registration successful', 'Success');

          this.router.navigate(['/login']);

          this.registerUserForm.reset();
        },
        error: (err) => {
          this.isLoading = false;
          console.log(err);

          if (err.error.errors) {
            err.error.errors['Email'] &&
              this.registerUserForm.controls['email'].setErrors({
                serverErrorEmail: err.error.errors?.Email[0],
              });
            err.error.errors['UserName'] &&
              this.registerUserForm.controls['username'].setErrors({
                username: err.error.errors?.UserName[0],
              });
          }
        },
      });
  }

  get registerUserFormControl() {
    return this.registerUserForm.controls;
  }

  isInvalidTouchedDirty(key: string) {
    let form = this.registerUserForm as any;

    return (
      (form.controls[key].invalid && form.controls[key].touched) ||
      form.controls[key].dirty
    );
  }
  isTouchedOrDirty(key: string) {
    let form = this.registerUserForm as any;
    return form.controls[key].touched || form.controls[key].dirty;
  }

  onBlur(event: Event, key: string) {
    let form = this.registerUserForm as any;
    //make the field touched
    form.controls[key].markAsTouched();
  }
}

export default class Validation {
  static match(controlName: string, checkControlName: string): ValidatorFn {
    return (controls: AbstractControl) => {
      const control = controls.get(controlName);
      const checkControl = controls.get(checkControlName);
      if (checkControl?.errors && !checkControl.errors['matching']) {
        return null;
      }
      if (control?.value !== checkControl?.value) {
        controls.get(checkControlName)?.setErrors({ matching: true });
        return { matching: true };
      } else {
        return null;
      }
    };
  }

  static validUsername(control: AbstractControl) {
    if (control.value) {
      const regex = new RegExp('^[a-zA-Z0-9]+$');
      if (!regex.test(control.value)) {
        return { validUsername: true };
      }
    }
    return null;
  }
}
