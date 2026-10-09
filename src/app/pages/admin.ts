import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `<section class="page admin-page">
    <p class="eyebrow">BEHIND THE COUNTER</p>
    <h1>Manage the shop</h1>
    <nav class="tabs" aria-label="Shop management">
      <a routerLink="/admin" routerLinkActive="selected" [routerLinkActiveOptions]="{ exact: true }"
        >Overview</a
      ><a routerLink="/admin/media" routerLinkActive="selected">Media</a
      ><a routerLink="/admin/customers" routerLinkActive="selected">Customers</a
      ><a routerLink="/admin/rentals" routerLinkActive="selected">Rentals & returns</a>
    </nav>
    <router-outlet />
  </section>`,
})
export class Admin {}
