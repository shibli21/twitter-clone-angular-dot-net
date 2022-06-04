import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { AuthService } from './../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  passwordHealth = 'w-[0%]';
  passwordStatus = 'Weak';
  startDate = new Date().toISOString().slice(0, 16);

  profileForm = new FormGroup(
    {
      username: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{6,}$/),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
      dateOfBirth: new FormControl('', [
        Validators.required,
        this.AgeValidator,
      ]),
    },
    {
      validators: [Validation.match('password', 'confirmPassword')],
    }
  );
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private _snackBar: MatSnackBar
  ) {}

  currentDate() {
    const currentDate = moment(new Date()).subtract(18, 'years');
    return currentDate.toISOString().substring(0, 10);
  }

  ngOnInit(): void {
    this.profileForm.controls['dateOfBirth'].setValue(this.currentDate());

    this.profileForm.controls['password'].valueChanges.subscribe((value) => {
      let score = 0;
      if (value.match(/[A-Z]/g)) score += 25;
      if (value.match(/\d/g)) score += 25;
      if (value.match(/[a-z]/g)) score += 25;
      if (value.length >= 6) score += 25;

      if (score <= 25) {
        this.passwordHealth = 'w-[' + score + '%]' + ' ' + 'bg-red-600 h-1.5';
        this.passwordStatus = 'Weak';
      } else if (score > 25 && score <= 50) {
        this.passwordHealth =
          'w-[' + score + '%]' + ' ' + 'bg-orange-600 h-1.5';
        this.passwordStatus = 'Medium';
      } else if (score > 50 && score <= 75) {
        this.passwordHealth =
          'w-[' + score + '%]' + ' ' + 'bg-yellow-400 h-1.5';
        this.passwordStatus = 'Medium';
      } else {
        this.passwordHealth = 'w-[' + score + '%]' + ' ' + 'bg-green-600 h-1.5';
        this.passwordStatus = 'Strong';
      }
    });
  }

  onSubmit() {
    if (!this.profileForm.valid) {
      return;
    }

    this.isLoading = true;

    const { username, email, password, confirmPassword, dateOfBirth } =
      this.profileForm.value;

    this.authService
      .register(username, email, password, confirmPassword, dateOfBirth)
      .subscribe(
        (res: any) => {
          this.isLoading = false;
          this._snackBar.open('You are registered successfully', '', {
            duration: 5 * 1000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
          });
          this.profileForm.reset();
        },
        (err) => {
          this.isLoading = false;
          if (err.error.errors) {
            this.profileForm.controls['email'].setErrors({
              serverErrorEmail: err.error.errors?.Email[0],
            });
            this.profileForm.controls['username'].setErrors({
              username: err.error.errors.Username[0],
            });
          }
        }
      );
  }

  get profileFormControl() {
    return this.profileForm.controls;
  }

  isInvalidTouchedDirty(key: string) {
    let form = this.profileForm;

    return (
      (form.controls[key].invalid && form.controls[key].touched) ||
      form.controls[key].dirty
    );
  }
  isTouchedOrDirty(key: string) {
    let form = this.profileForm;
    return form.controls[key].touched || form.controls[key].dirty;
  }

  AgeValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (moment(control.value).add(18, 'years') >= moment()) {
      return { age: true };
    }
    return null;
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
}
