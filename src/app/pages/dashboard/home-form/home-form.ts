import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ShariButton } from '../../../shared/components/button/shari-button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { HomeHeroService } from '../../../shared/services/home-hero';
import { Router } from '@angular/router';
import { Snackbar } from '../../../shared/components/snackbar';

@Component({
  selector: 'shari-home-form',
  imports: [ReactiveFormsModule, ShariButton, MatProgressSpinner],
  templateUrl: './home-form.html',
  styleUrl: './home-form.scss'
})
export class HomeForm {
  homeHeroService = inject(HomeHeroService);
  router = inject(Router);
  snackbar = inject(Snackbar);

  form = new FormGroup({
    textContent: new FormControl('', { nonNullable: true })
  });

  isLoading = signal(false);

  constructor() {
    this.populateForm();
  }

  async populateForm() {
    try {
      const hero = await this.homeHeroService.getHeroContent();
      if (!hero) return;

      this.form.patchValue({ textContent: hero.textContent });

    } catch (err: unknown) {
      this.snackbar.show('Unable To Load The Hero Section Data', 'red');
    }
  }

  async onSaveClick(): Promise<void> {
    if (this.form.invalid) {
      this.snackbar.show('Invalid Input!', 'red');
      return;
    }

    this.isLoading.set(true);
    let formData = this.form.getRawValue();

    try {
      await this.homeHeroService.updateHeroContent(formData);

      this.snackbar.show('Hero Section Updated');

    } catch (err: unknown) {
      this.snackbar.show('Unable To Save Changes!', 'red');

    } finally {
      this.isLoading.set(false);
    }
  }

  closeForm(): void {
    this.router.navigateByUrl('dashboard-1975/paintings');
  }
}
