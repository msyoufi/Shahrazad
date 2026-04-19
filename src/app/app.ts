import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';
import { Footer } from './shared/components/footer/footer';
import { OrderModal } from './shared/components/order-modal/order-modal';
import { AuthService } from './shared/services/auth';
import { OrderModalService } from './shared/components/order-modal/order-modal-service';

@Component({
  selector: 'shari-root',
  imports: [RouterOutlet, Header, Footer, OrderModal],
  templateUrl: './app.html',
})
export class App {
  authService = inject(AuthService);
  orderModalService = inject(OrderModalService);
}
