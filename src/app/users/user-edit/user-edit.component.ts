import { UsersService } from './../users.service';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
})
export class UserEditComponent implements OnInit {
  userEditForm = new FormGroup({
    email: new FormControl('', [Validators.required]),
    dateOfBirth: new FormControl('', [Validators.required, this.AgeValidator]),
  });
  id: string = this.router.url.split('/')[3];
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private _snackBar: MatSnackBar,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.usersService.getUser(this.id).subscribe((user) => {
      this.userEditForm = new FormGroup({
        email: new FormControl(user.email, [Validators.required]),
        dateOfBirth: new FormControl(user.dateOfBirth, [
          Validators.required,
          this.AgeValidator,
        ]),
      });
    });
  }

  onSubmit() {
    if (!this.userEditForm.valid) {
      return;
    }

    this.isLoading = true;

    const { email, dateOfBirth } = this.userEditForm.value;

    this.usersService.updateUser(this.id, email, dateOfBirth).subscribe(
      (res: any) => {
        this.isLoading = false;
        this._snackBar.open('User updated successfully', '', {
          duration: 5 * 1000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
      },
      (err) => {
        this.isLoading = false;
        if (err.error.errors) {
          this.userEditForm.controls['email'].setErrors({
            serverErrorEmail: err.error.errors?.Email[0],
          });
          this.userEditForm.controls['username'].setErrors({
            username: err.error.errors.Username[0],
          });
        }
      }
    );
  }

  get userEditFormControl() {
    return this.userEditForm.controls;
  }

  isInvalidTouchedDirty(key: string) {
    let form = this.userEditForm;

    return (
      (form.controls[key].invalid && form.controls[key].touched) ||
      form.controls[key].dirty
    );
  }
  isTouchedOrDirty(key: string) {
    let form = this.userEditForm;
    return form.controls[key].touched || form.controls[key].dirty;
  }

  AgeValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (moment(control.value).add(18, 'years') >= moment()) {
      return { age: true };
    }
    return null;
  }
}
