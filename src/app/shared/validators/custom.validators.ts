import { AbstractControl, ValidationErrors } from "@angular/forms";

export default class ShariValidators {
  static password(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    const errors: any = {};

    if (/\s/.test(password)) errors.hasWhiteSpace = true;
    if (!/[A-Za-z]/.test(password)) errors.noLetter = true;
    if (!/\d/.test(password)) errors.noDigit = true;

    return Object.keys(errors).length ? errors : null;
  }
}