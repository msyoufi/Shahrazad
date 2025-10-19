import { Component, inject } from '@angular/core';
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
}