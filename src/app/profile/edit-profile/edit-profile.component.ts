import { ToastrService } from 'ngx-toastr';
import { UserService } from './../user.service';
import { AuthService } from './../../auth/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit {
  genders = [
    { name: 'Male', value: 'male' },
    {
      name: 'Female',
      value: 'female',
    },
  ];

  isUpdating = false;
  editProfileForm: FormGroup = new FormGroup({
    userName: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    bio: new FormControl(''),
    address: new FormControl(''),
    coverPictureUrl: new FormControl(''),
    profilePictureUrl: new FormControl(''),
    gender: new FormControl('male', [Validators.required]),
    dateOfBirth: new FormControl(new Date(), [Validators.required]),
  });

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.authService.user.subscribe((user) => {
      this.editProfileForm.patchValue({
        ...user!,
        dateOfBirth: new Date(user!.dateOfBirth),
      });
    });
  }

  onSubmit() {
    this.isUpdating = true;

    this.userService
      .updateUser({
        ...this.editProfileForm.value,
        id: this.authService.userId(),
      })
      .subscribe({
        next: (res) => {
          this.authService.user.next({
            ...this.authService.user.value,
            ...res,
            followers: this.authService.user.value!.followers,
            following: this.authService.user.value!.following,
          });
          this.toastr.success('Profile updated successfully');
          this.isUpdating = false;
        },
        error: (err) => {
          this.isUpdating = false;
          console.log(err);

          if (err.error.errors) {
            err.error.errors['Email'] &&
              this.editProfileForm.controls['email'].setErrors({
                serverErrorEmail: err.error.errors?.Email[0],
              });
            err.error.errors['UserName'] &&
              this.editProfileForm.controls['userName'].setErrors({
                userName: err.error.errors?.UserName[0],
              });
          }
        },
      });
  }

  get editProfileFormControl() {
    return this.editProfileForm.controls;
  }

  isInvalidTouchedDirty(key: string) {
    let form = this.editProfileForm as any;

    return (
      (form.controls[key].invalid && form.controls[key].touched) ||
      form.controls[key].dirty
    );
  }
  isTouchedOrDirty(key: string) {
    let form = this.editProfileForm as any;
    return form.controls[key].touched || form.controls[key].dirty;
  }

  onBlur(event: Event, key: string) {
    let form = this.editProfileForm as any;
    form.controls[key].markAsTouched();
  }
}
