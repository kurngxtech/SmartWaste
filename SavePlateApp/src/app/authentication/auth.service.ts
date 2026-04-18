import { Injectable } from '@angular/core';

@Injectable({
   providedIn: 'root'
})
export class AuthService {
   private users: any[] = [];

   constructor() { }

   register(user: any): void {
      this.users.push(user);
      console.log('User registered:', user);
   }

   checkEmailExists(email: string): boolean {
      return this.users.some(u => u.email === email);
   }
}
