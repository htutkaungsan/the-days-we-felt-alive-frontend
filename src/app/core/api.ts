import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Envelope } from './types';
@Injectable({ providedIn: 'root' })
export class Api {
  private http = inject(HttpClient);
  get<T>(path: string) {
    return this.http.get<Envelope<T>>('/api/v1' + path);
  }
  post<T>(path: string, body: unknown) {
    return this.http.post<Envelope<T>>('/api/v1' + path, body);
  }
  patch<T>(path: string, body: unknown) {
    return this.http.patch<Envelope<T>>('/api/v1' + path, body);
  }
  delete(path: string) {
    return this.http.delete<Envelope<{ message: string }>>('/api/v1' + path);
  }
}
