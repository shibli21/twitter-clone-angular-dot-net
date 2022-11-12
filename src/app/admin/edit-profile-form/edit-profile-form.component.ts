import { IEditUser } from './../../core/models/user.model';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { IUser } from '../../core/models/user.model';
import { EditUserService } from '../../core/services/edit-user.service';
import { UserService } from '../../core/services/user.service';
import Validation from 'src/app/settings/edit-profile/edit-profile.component';

@Component({
  selector: 'app-edit-profile-form',
  templateUrl: './edit-profile-form.component.html',
  styleUrls: ['./edit-profile-form.component.scss'],
})
export class EditProfileFormComponent implements OnInit {
  @Input() user!: IUser;
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
    CoverPicture: new FormControl(File, [Validation.fileMaxSize]),
    ProfilePicture: new FormControl(File, [Validation.fileMaxSize]),
    gender: new FormControl('male', [Validators.required]),
    dateOfBirth: new FormControl(new Date(), [Validators.required]),
  });

  constructor(
    private userService: UserService,
    private toastr: ToastrService,
    private editUserService: EditUserService
  ) {}

  ngOnInit(): void {
    this.editProfileForm.patchValue({
      ...this.user,
      dateOfBirth: new Date(this.user.dateOfBirth),
    });
  }

  onSubmit() {
    this.isUpdating = true;
    const formData = this.toFormData(this.editProfileForm.value);

    this.userService.updateUser(formData).subscribe({
      next: (res) => {
        this.toastr.success('Profile updated successfully');
        this.isUpdating = false;
        this.editUserService.setEditingDialog(false);
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

  onFileChange(event: Event, key: string) {
    let form = this.editProfileForm as any;

    const fileList: FileList | null = (event.target as HTMLInputElement).files;

    if (fileList) {
      form.controls[key].setValue(fileList[0]);
      form.controls[key].markAsDirty();
    }
  }

  private toFormData(formValue: IEditUser) {
    const formData = new FormData();

    formData.set('id', this.user.id);
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
}
