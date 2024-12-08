import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  passwordForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';

  
  private apiUrl = 'http://localhost:5245/api/Auth/changePassword';  // API URL

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    }, { validator: this.passwordMatchValidator });
  }

  // Şifrələrin uyğun olub olmadığını yoxlayan validator
  passwordMatchValidator(formGroup: FormGroup) {
    const newPassword = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { notMatched: true };
  }

  onSubmit() {
    if (this.passwordForm.valid) {
      const payload = this.passwordForm.value;

      // Tokeni localStorage-dan əldə et
      const token = localStorage.getItem('authToken');
      
      // Token yoxlanır və Authorization başlığına əlavə olunur
      if (!token) {
        this.errorMessage = 'Xahiş edirik, əvvəlcə daxil olun.';
        return;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`  // Token Authorization başlığında göndərilir
      });

      // Şifrə dəyişdirmək üçün POST sorğusu
      this.http.post(this.apiUrl, payload, { headers })
        .subscribe({
          next: (response: any) => {
            this.successMessage = 'Şifrə uğurla dəyişdirildi!';
            this.errorMessage = '';
            this.passwordForm.reset();
          },
          error: (err) => {
            this.successMessage = '';
            if (err.status === 401) {
              this.errorMessage = 'Siz hələ daxil olmamısınız və ya tokeniniz keçərli deyil.';
            } else {
              this.errorMessage = 'Şifrə dəyişdirilə bilmədi. Zəhmət olmasa, yenidən cəhd edin.';
            }
            console.error(err);  // Xətanı konsola yazmaq üçün
          }
        });
    }
  }
}
