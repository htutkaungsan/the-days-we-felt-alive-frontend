import { Component,inject } from '@angular/core';
import { Router,RouterLink,RouterLinkActive,RouterOutlet } from '@angular/router';
import { Auth } from './core/auth';
@Component({selector:'app-root',imports:[RouterLink,RouterLinkActive,RouterOutlet],templateUrl:'./app.html'})
export class App {
  auth=inject(Auth); private router=inject(Router);
  logout() { this.auth.logout(); void this.router.navigate(['/']); }
}
