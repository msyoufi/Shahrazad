import { Component, inject, signal } from '@angular/core';
import { ProfileService } from '../../shared/services/profile';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'shari-about',
  imports: [MatProgressSpinner],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About {
  profileService = inject(ProfileService);

  profile = signal<Profile | undefined>(undefined);

  constructor() {
    this.getProfile();
  }

  async getProfile(): Promise<void> {
    const profile = await this.profileService.getProfile();
    this.profile.set(profile);
  }
}