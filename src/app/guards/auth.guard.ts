import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // Token yoxlanılır
    const token = localStorage.getItem('authToken');
    if (token) {
      // Token varsa, admin səhifəsinə keçməyə icazə veririk
      return true;
    } else {
      // Token yoxdursa, login səhifəsinə yönləndiririk
      this.router.navigate(['/admin-login']);
      return false;
    }
  }
}
