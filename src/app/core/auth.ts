import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, firstValueFrom } from 'rxjs';
import { Envelope, User } from './types';
@Injectable({ providedIn: 'root' })
export class Auth {
  private http = inject(HttpClient);
  user = signal<User | null>(null);
  token = signal<string | null>(sessionStorage.getItem('alive-token'));
  async restore() {
    if (!this.token()) return;
    try {
      const result = await firstValueFrom(this.http.get<Envelope<User>>('/api/v1/auth/me'));
      this.user.set(result.data);
    } catch {
      this.logout();
    }
  }
  login(email: string, password: string) {
    return this.http
      .post<Envelope<{ token: string; user: User }>>('/api/v1/auth/login', { email, password })
      .pipe(
        tap((r) => {
          sessionStorage.setItem('alive-token', r.data.token);
          this.token.set(r.data.token);
          this.user.set(r.data.user);
        }),
      );
  }
  logout() {
    sessionStorage.removeItem('alive-token');
    this.token.set(null);
    this.user.set(null);
  }
}
