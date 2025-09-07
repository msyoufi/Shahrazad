import { AbstractControl, ValidationErrors } from "@angular/forms";

export default class ShariValidators {
  static password(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    const errors: any = {};

    if (/\s/.test(password)) errors.whiteSpace = true;
    if (!/[A-Z]/.test(password)) errors.noUpper = true;
    if (!/[a-z]/.test(password)) errors.noLower = true;
    if (!/\d/.test(password)) errors.noDigit = true;

    return Object.keys(errors).length ? errors : null;
  }
}