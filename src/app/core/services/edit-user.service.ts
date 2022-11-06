import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EditUserService {
  private editingDialog = new BehaviorSubject<boolean>(false);
  isEditingDialogObservable = this.editingDialog.asObservable();

  constructor() {}

  public setEditingDialog(val: boolean) {
    this.editingDialog.next(val);
  }
}
