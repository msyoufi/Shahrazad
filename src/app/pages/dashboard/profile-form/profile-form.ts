import { Component, inject, signal } from '@angular/core';
import { ProfileService } from '../../../shared/services/profile';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Snackbar } from '../../../shared/components/snackbar';
import { ShariButton } from '../../../shared/components/button/shari-button';
import { Router } from '@angular/router';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'shari-profile-form',
  imports: [ReactiveFormsModule, ShariButton, MatProgressSpinner],
  templateUrl: './profile-form.html',
  styleUrl: './profile-form.scss'
})
export class ProfileForm {
  profileService = inject(ProfileService);
  router = inject(Router);
  snackbar = inject(Snackbar);

  profileImage: File | undefined;
  coverImage: File | undefined;

  form = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    bio: new FormControl('', { nonNullable: true }),
  });

  isLoading = signal(false);
  progress = signal('');

  constructor() {
    this.populateForm();
  }

  async populateForm(): Promise<void> {
    try {
      const profile = await this.profileService.getProfile();
      if (!profile) return;

      const { name, bio } = profile;

      this.form.patchValue({ name, bio });

    } catch (err: unknown) {
      this.snackbar.show('Unable To Load The Profile Data', 'red');
    }
  }

  onImageChange(e: any, type: 'profile' | 'cover'): void {
    const file = e.target.files[0];
    if (!this.checkValidImage(file)) return;

    if (type === 'profile')
      this.profileImage = file;
    else
      this.coverImage = file;
  }

  checkValidImage(file: File | undefined): boolean {
    if (!file) return false;

    if (!file.type.startsWith('image/')) {
      this.snackbar.show(`Invalid image type: ${file.name}`, 'red');
      return false;
    }

    return true;
  }

  async onSaveClick(): Promise<void> {
    if (this.form.invalid) {
      this.snackbar.show('Invalid Painting Data!', 'red');
      return;
    }

    this.isLoading.set(true);
    let formData = this.form.getRawValue();

    try {
      if (this.profileImage) {
        this.progress.set('Uploading profile image...');
        const profileImageUrl = await this.uploadImage(this.profileImage, 'profile');
        formData = Object.assign(formData, { profileImageUrl });
      }

      if (this.coverImage) {
        this.progress.set('Uploading cover image...');
        const coverImageUrl = await this.uploadImage(this.coverImage, 'cover');
        formData = Object.assign(formData, { coverImageUrl });
      }

      this.progress.set('Updating profile data...');
      await this.profileService.updateProfile(formData);

      this.snackbar.show('Profile Updated');

    } catch (err: unknown) {
      this.snackbar.show('Unable To Save Changes!', 'red');

    } finally {
      this.isLoading.set(false);
      this.progress.set('Done');
      this.profileImage = undefined;
      this.coverImage = undefined;
    }
  }

  private uploadImage(img: File, name: 'profile' | 'cover'): Promise<string> {
    return this.profileService.compressAndUpload(img, name);
  }

  closeForm(): void {
    this.router.navigateByUrl('dashboard-1975/overview');
  }
}