import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';
import { Footer } from './shared/components/footer/footer';

@Component({
  selector: 'shari-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html'
})
export class App {
  protected readonly title = signal('shahrazad');
}
