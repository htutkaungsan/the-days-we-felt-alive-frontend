import { ApplicationConfig,provideBrowserGlobalErrorListeners,provideAppInitializer,inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient,withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { Auth } from './core/auth';
import { jwtInterceptor } from './core/security';
export const appConfig:ApplicationConfig={providers:[provideBrowserGlobalErrorListeners(),provideRouter(routes),provideHttpClient(withInterceptors([jwtInterceptor])),provideAppInitializer(()=>inject(Auth).restore())]};
