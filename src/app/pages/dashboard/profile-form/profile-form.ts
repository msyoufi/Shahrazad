import { Component, effect, inject, signal } from '@angular/core';
import { ProfileService } from '../../../shared/services/profile';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Snackbar } from '../../../shared/components/snackbar';
import { ShariButton } from '../../../shared/components/button/shari-button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ConfirmDialogService } from '../../../shared/components/confirmation-dialog/confirm-dialog.service';
import { type CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'shari-profile-form',
  imports: [ReactiveFormsModule, ShariButton, MatProgressSpinner, CdkDrag, CdkDropList],
  templateUrl: './profile-form.html',
  styleUrl: './profile-form.scss',
})
export class ProfileForm {
  profileService = inject(ProfileService);
  confirmDialog = inject(ConfirmDialogService);
  snackbar = inject(Snackbar);

  private profileImage: File | undefined;
  private coverImage: File | undefined;
  private studioShotsChanged = false;

  form = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    bio_html: new FormControl('', { nonNullable: true }),
    email: new FormControl('', { nonNullable: true }),
    hero_html: new FormControl('', { nonNullable: true }),
  });

  studioShotsUrls = signal<(StudioShotUrl | LocalStudioShotImage)[]>([]);
  isLoading = signal(false);
  progress = signal('');
  bioSectionsCount = signal('');

  constructor() {
    effect(() => this.populateForm());
    this.calcualteBioSectionsCount();
  }

  populateForm(): void {
    const profile = this.profileService.profile;
    if (!profile) return;

    const { studioShotsUrls, profileImageUrl, coverImageUrl, ...profileData } = profile;

    this.form.patchValue(profileData);
    this.studioShotsUrls.set(studioShotsUrls);
  }

  calcualteBioSectionsCount(): void {
    this.form.valueChanges.subscribe((newValue) => {
      const textChunks = newValue.bio_html?.split('---').filter(Boolean) ?? [];
      const newSectionsCount = textChunks.length ? `(${textChunks.length} Sections)` : '';
      this.bioSectionsCount.set(newSectionsCount);
    });
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

      if (this.studioShotsChanged) {
        this.progress.set('Updating The Studio Shots...');
        const studioShotsUrls = await this.profileService.updateStudioShots(this.studioShotsUrls());
        formData = Object.assign(formData, { studioShotsUrls });
      }

      this.progress.set('Updating profile data...');
      await this.profileService.updateProfile(formData);

      this.snackbar.show('Profile Updated');
      this.progress.set('Done');
      this.profileImage = undefined;
      this.coverImage = undefined;
    } catch (err: unknown) {
      this.snackbar.show('Unable To Save Changes!', 'red');
      this.progress.set('');
    } finally {
      this.isLoading.set(false);
    }
  }

  onImageChange(e: any, target: 'profile' | 'cover'): void {
    const file = e.target.files[0];
    if (!file || !this.checkValidImage(file)) return;

    if (target === 'profile') this.profileImage = file;
    else this.coverImage = file;
  }

  onStudioShotsChange(e: any): void {
    const files = e.target.files;
    if (!files.length) return;

    const localUrls: LocalStudioShotImage[] = [];

    for (const file of files) {
      if (!this.checkValidImage(file)) return;

      localUrls.push({
        url: URL.createObjectURL(file),
        file: file,
      });
    }

    const nextImagesUrl = this.studioShotsUrls().concat(localUrls);
    this.studioShotsUrls.set(nextImagesUrl);
    this.studioShotsChanged = true;
  }

  onStudioShotDrop(event: CdkDragDrop<(StudioShotUrl | LocalStudioShotImage)[]>): void {
    moveItemInArray(this.studioShotsUrls(), event.previousIndex, event.currentIndex);
    this.studioShotsChanged = true;
  }

  async onRemoveImageClick(target: StudioShotUrl | LocalStudioShotImage): Promise<void> {
    let nextImagesUrls = [];

    if ('id' in target) {
      const confirm = await this.confirmDialog.open({
        title: 'Remove a Studio Shot',
        message: 'Remove this image from the "About Me" page?',
        actionButton: 'Remove',
      });

      if (!confirm) return;

      nextImagesUrls = this.studioShotsUrls().filter(
        (img) => ('id' in img ? img.id !== target.id : true), // keep all local images
      );
    } else {
      nextImagesUrls = this.studioShotsUrls().filter((img) => img.url !== target.url);
    }

    this.studioShotsUrls.set(nextImagesUrls);
    this.studioShotsChanged = true;
  }

  checkValidImage(file: File | undefined): boolean {
    if (!file) return false;

    if (!file.type.startsWith('image/')) {
      this.snackbar.show(`Invalid image type: ${file.name}`, 'red');
      return false;
    }

    return true;
  }

  private uploadImage(img: File, name: string): Promise<string> {
    return this.profileService.compressAndUpload(img, name);
  }
}
