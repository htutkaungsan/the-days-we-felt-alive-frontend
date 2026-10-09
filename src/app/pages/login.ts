import { Component,inject,signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router,RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Auth } from '../core/auth';
import { Api } from '../core/api';
import { message } from '../core/types';
@Component({imports:[FormsModule,RouterLink],template:`
<section class="auth-layout"><div class="auth-story"><p class="eyebrow">WELCOME TO THE SHOP</p><h1>Make room for<br>something good.</h1><p>Your next favorite album or movie might be waiting on our shelf.</p><div class="record" aria-hidden="true"><span>ALIVE<br>RECORDS</span></div></div>
<div class="form-panel"><p class="eyebrow">{{register?'A NEW CHAPTER':'GOOD TO SEE YOU'}}</p><h2>{{register?'Join the shop':'Sign in'}}</h2><p>{{register?'Create an account to rent from our collection.':'Pick up where you left off.'}}</p>
@if(error()){<p role="alert" class="alert error">{{error()}}</p>}
<form (ngSubmit)="submit()" #form="ngForm">
@if(register){<label>Your name<input name="name" [(ngModel)]="name" required maxlength="100" autocomplete="name"></label>}
<label>Email address<input type="email" name="email" [(ngModel)]="email" required email maxlength="150" autocomplete="email"></label>
<label>Password<input type="password" name="password" [(ngModel)]="password" required minlength="8" [autocomplete]="register?'new-password':'current-password'"></label>
@if(register){<small>At least 8 characters. Maximum 72 bytes.</small>}
<button [disabled]="busy() || form.invalid">{{busy()?'Please wait…':register?'Create account':'Sign in'}}</button></form>
<p class="form-bottom">{{register?'Already a member?':'New around here?'}} <a [routerLink]="register?'/login':'/register'">{{register?'Sign in':'Create an account'}}</a></p></div></section>`})
export class Login {
 private router=inject(Router); private auth=inject(Auth); private api=inject(Api);
 get register(){return this.router.url==='/register';}
 name=''; email=''; password=''; busy=signal(false); error=signal('');
 async submit(){ if(this.busy())return; this.busy.set(true);this.error.set('');
 try { if(this.register) await firstValueFrom(this.api.post('/auth/register',{name:this.name,email:this.email,password:this.password}));
 await firstValueFrom(this.auth.login(this.email,this.password));
 await this.router.navigate([this.auth.user()?.role==='admin'?'/admin':'/']);
 }catch(e){this.error.set(message(e));}finally{this.busy.set(false);} }
}
