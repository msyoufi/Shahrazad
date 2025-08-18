import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ShariButton } from '../../../shared/components/button/shari-button';

@Component({
  selector: 'shari-painting-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, ShariButton],
  templateUrl: './painting-form.html',
  styleUrl: './painting-form.scss'
})
export class PaintingForm {

  main_image: File | null = null;
  close_ups: File[] = [];

  form = new FormGroup({
    id: new FormControl<string | null>(null),
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    material: new FormControl('', { nonNullable: true }),
    width: new FormControl('', [Validators.required, Validators.min(1)]),
    height: new FormControl('', [Validators.required, Validators.min(1)]),
    year: new FormControl('', Validators.min(2000))
  });

  onSubmit(): void {
    console.log(this.form.value)
  }
}
