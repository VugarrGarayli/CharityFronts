// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { BehaviorSubject } from 'rxjs';
// import { Router } from '@angular/router';
// import jwt_decode from 'jwt-decode';

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthService {
//   private _roleSubject = new BehaviorSubject<number | null>(null);
//   public role$ = this._roleSubject.asObservable();

//   constructor(private router: Router) {}

//   login(token: string): void {
//     localStorage.setItem('token', token);

//     try {
//       const decodedToken = jwt_decode(token); // Token-i dekodlaşdırırıq
//       if (decodedToken && decodedToken.role) {
//         this._roleSubject.next(decodedToken.role);
//       }
//     } catch (error) {
//       console.error('JWT Decode error:', error);
//     }
//   }

//   logout(): void {
//     localStorage.removeItem('token');
//     this._roleSubject.next(null);
//     this.router.navigate(['/login']);
//   }

//   getUserRole(): number | null {
//     return this._roleSubject.value;
//   }

//   isAdmin(): boolean {
//     return this.getUserRole() === 1; // Admin rolu
//   }

//   isModerator(): boolean {
//     return this.getUserRole() === 2; // Moderator rolu
//   }
// }

import { Injectable } from '@angular/core';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  // Token-i localStorage-dən və ya başqa bir yerdən alın
  getToken(): string | null {
    return localStorage.getItem('authToken');  // Və ya başqa bir yer
  }

  // Token-dən istifadəçi rolunu almaq
  getUserRole(): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken: any = jwt_decode(token);  // JWT token-in dekodlaşdırılması
      console.log(decodedToken); // Debugging üçün
      return decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];  // Düzgün rol sahəsini əldə edirik
    }
    return null;
  }

  // Admin olub-olmamaq
  isAdmin(): boolean {
    const role = this.getUserRole();
    return role === '1';  // 1 - Admin
  }

  // Moderator olub-olmamaq
  isModerator(): boolean {
    const role = this.getUserRole();
    return role === '2';  // 2 - Moderator
  }
}
