import { Notifications, Toasts } from './core/notifications';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from './core/auth';
@Component({
  selector: 'app-root',
  imports: [Toasts, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  auth = inject(Auth);
  private notifications = inject(Notifications);
  private router = inject(Router);
  logout() {
    this.auth.logout();
    this.notifications.show('You have signed out. See you again soon.', 'info');
    void this.router.navigate(['/']);
  }
}
