import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../core/services/user.service';
import { IEditUser } from './../../core/models/user.model';
import { AuthService } from './../../core/services/auth.service';
import { ProfileService } from './../../core/services/profile.service';

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
    ProfilePicture: new FormControl(File, [Validation.fileMaxSize]),
    CoverPicture: new FormControl(File, [Validation.fileMaxSize]),
    gender: new FormControl('male', [Validators.required]),
    dateOfBirth: new FormControl(new Date(), [Validators.required]),
  });

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.authService.userObservable.subscribe((user) => {
      this.editProfileForm.patchValue({
        ...user!,
        dateOfBirth: new Date(user!.dateOfBirth),
      });
    });
  }

  onSubmit() {
    const formData = this.toFormData(this.editProfileForm.value);

    this.isUpdating = true;

    this.userService.updateUser(formData).subscribe({
      next: (res) => {
        this.authService.setUser(res);
        this.profileService.setUser(res);
        this.toastr.success('Profile updated successfully');
        this.isUpdating = false;
      },
      error: (err) => {
        this.isUpdating = false;

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

  private toFormData(formValue: IEditUser) {
    const formData = new FormData();

    formData.set('id', this.authService.userId()!);
    formData.set('userName', formValue.userName);
    formData.set('email', formValue.email);
    formData.set('firstName', formValue.firstName);
    formData.set('lastName', formValue.lastName);
    formData.set('gender', formValue.gender);
    formData.set('dateOfBirth', new Date(formValue.dateOfBirth).toISOString());

    formValue.bio && formData.set('bio', formValue.bio);
    formValue.address && formData.set('address', formValue.address);

    formValue.CoverPicture &&
      formData.set('CoverPicture', formValue.CoverPicture);

    formValue.ProfilePicture &&
      formData.set('ProfilePicture', formValue.ProfilePicture);

    return formData;
  }

  onFileChange(event: Event, key: string) {
    let form = this.editProfileForm as any;

    const fileList: FileList | null = (event.target as HTMLInputElement).files;

    if (fileList) {
      form.controls[key].setValue(fileList[0]);
      form.controls[key].markAsDirty();
    }
  }
}

export default class Validation {
  static fileMaxSize(control: AbstractControl) {
    const file = control.value as File;
    if (file && file.size > 400 * 400 * 2) {
      return { fileMaxSize: true };
    }
    return null;
  }
}
