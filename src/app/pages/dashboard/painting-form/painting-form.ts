import { Component, effect, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ShariButton } from '../../../shared/components/button/shari-button';
import { PaintingFormService } from './painting-form.service';

@Component({
  selector: 'shari-painting-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, ShariButton],
  templateUrl: './painting-form.html',
  styleUrl: './painting-form.scss'
})
export class PaintingForm {
  formService = inject(PaintingFormService);

  main_image: File | null = null;
  close_ups: File[] = [];

  maxYear = new Date().getFullYear();

  form = new FormGroup({
    id: new FormControl<string | null>(null),
    title: new FormControl('', Validators.required),
    material: new FormControl(''),
    width: new FormControl('', [Validators.required, Validators.min(1)]),
    height: new FormControl('', [Validators.required, Validators.min(1)]),
    year: new FormControl('', [Validators.min(2000), Validators.max(this.maxYear)])
  });

  constructor() {
    this.populateForm();
  }

  populateForm(): void {
    effect(() => {
      const painting = this.formService.painting;

      if (painting)
        this.form.patchValue({
          id: painting.id,
          title: painting.title,
          material: painting.material,
          width: painting.width.toString(),
          height: painting.height.toString(),
          year: painting.year.toString()
        });
    });
  }

  onSubmit(): void {
    // if (this.form.invalid) return;
    console.log(this.maxYear)

    console.log(this.form.value)
  }

  onCancleClick(): void {
    this.form.reset();
    this.formService.closeForm();
  }
}
