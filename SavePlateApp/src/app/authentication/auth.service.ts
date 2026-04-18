import { Injectable } from '@angular/core';

@Injectable({
   providedIn: 'root'
})
export class AuthService {
   private users: any[] = [];
   private pendingRegistrations: Map<string, { user: any, code: string }> = new Map();

   constructor() { }

   sendVerificationEmail(user: any): boolean {
      if (!user.email.toLowerCase().endsWith('@gmail.com')) {
         return false;
      }
      
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      this.pendingRegistrations.set(user.email, { user, code });
      
      console.log(`[SYSTEM] ------------------------------------------------`);
      console.log(`[SYSTEM] Simulated Email Sent to: ${user.email}`);
      console.log(`[SYSTEM] Subject: Welcome to SavePlate! Verification Code`);
      console.log(`[SYSTEM] Message: Hello ${user.fullName}, your 6-digit verification code is: ${code}`);
      console.log(`[SYSTEM] ------------------------------------------------`);
      
      return true;
   }

   verifyCodeAndRegister(email: string, code: string): boolean {
      const pending = this.pendingRegistrations.get(email);
      if (pending && pending.code === code) {
         this.users.push(pending.user);
         this.pendingRegistrations.delete(email);
         console.log('User registered successfully:', pending.user);
         return true;
      }
      return false;
   }

   register(user: any): void {
      this.users.push(user);
      console.log('User registered:', user);
   }

   checkEmailExists(email: string): boolean {
      return this.users.some(u => u.email === email);
   }
}
