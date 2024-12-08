import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent {
  username: string = '';
  password: string = '';
  private apiUrl = 'http://localhost:5245/api/Auth/login'; // Backend URL

  constructor(private router: Router, private http: HttpClient) {}

  onLogin() {
    const payload = { email: this.username, password: this.password };

    // API vasitəsilə login
    this.http.post<any>(this.apiUrl, payload).subscribe(
      (response) => {
        if (response && response.isSuccess && response.data && response.data.token) {
          // Token saxlanır
          localStorage.setItem('authToken', response.data.token);
          console.log('Token saxlanıldı:', response.data.token);

          // Admin səhifəsinə yönləndiririk
          this.router.navigate(['/admin']);
        } else {
          // Xətalar varsa
          const errorMessage = response.errors?.join(', ') || 'Giriş uğursuz oldu.';
          alert(errorMessage);
        }
      },
      (error) => {
        console.error('Login zamanı xəta baş verdi:', error);
        const errorDetail = error.error?.message || error.statusText || 'Giriş zamanı xəta baş verdi.';
        alert(`Xəta: ${errorDetail}`);
      }
    );
  }
}
