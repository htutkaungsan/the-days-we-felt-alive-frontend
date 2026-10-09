export interface User { id:number; name:string; email:string; role:'admin'|'customer'; active:boolean; }
export interface Media { id:number; title:string; creator:string; category:'music'|'movie'; format:'CD'|'DVD'; total_copies:number; available_copies:number; daily_fee:number; daily_late_fee:number; archived:boolean; }
export interface Rental { id:number; customer_id:number; media_id:number; title:string; customer_name:string; customer_email:string; format:string; rented_on:string; due_on:string; returned_on:string|null; rental_days:number; daily_fee:number; daily_late_fee:number; rental_fee:number; late_fee:number; total:number; estimated_total:number; estimated_late_fee:number; status:'active'|'overdue'|'returned'; days_late:number; }
export interface Envelope<T> { data:T; }
export function message(error:unknown):string {
  const e=error as { status?:number; error?:{error?:{message?:string}} };
  return e.status===0 ? 'Cannot reach the shop. Please check your connection and try again.' : e.error?.error?.message || 'Something went wrong. Please try again.';
}
