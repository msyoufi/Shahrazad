import { Component } from '@angular/core';

@Component({
  selector: 'shari-footer',
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  currentYear = new Date().getFullYear();
}
