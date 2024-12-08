import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-session-user',
  templateUrl: './session-user.component.html',
  styleUrl: './session-user.component.scss'
})
export class SessionUserComponent {
  userData: any = null; // İstifadəçi məlumatlarını saxlamaq üçün
  editData: any = {}; // Redaktə form məlumatları üçün
  editMode: boolean = false; // Redaktə rejimini idarə etmək üçün

  

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getUserData(); // Komponent yüklənəndə məlumatları gətir
  }

  // getUserData(): void {
  //   const token = localStorage.getItem('authToken'); // Tokeni götür
  //   const headers = new HttpHeaders({
  //     Authorization: `Bearer ${token}`,
  //   });

  //   this.http
  //     .get('http://localhost:5245/api/Auth/sessionuser', { headers })
  //     .subscribe({
  //       next: (data) => {
  //         this.userData = data; // İstifadəçi məlumatlarını doldur
  //         this.editData = { ...this.userData }; // Redaktə məlumatları üçün
  //       },
  //       error: (error) => {
  //         console.error('Məlumatları gətirərkən xəta:', error);
  //       },
  //     });
  // }

  // updateUser(): void {
  //   const token = localStorage.getItem('token'); // Tokeni götür
  //   const headers = new HttpHeaders({
  //     Authorization: `Bearer ${token}`,
  //   });

  //   this.http
  //     .put('http://localhost:5245/api/Auth/updateuser', this.editData, { headers })
  //     .subscribe({
  //       next: () => {
  //         this.userData = { ...this.editData }; // Məlumatları yenilə
  //         this.editMode = false; // Redaktə rejimini söndür
  //         alert('Məlumatlar uğurla yeniləndi!');
  //       },
  //       error: (error) => {
  //         console.error('Məlumatları yeniləyərkən xəta:', error);
  //         alert('Məlumatları yeniləmək mümkün olmadı!');
  //       },
  //     });
  // }

  getUserData(): void {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  
    this.http
  .get('http://localhost:5245/api/Auth/sessionuser', { headers })
  .subscribe({
    next: (response: any) => {
      this.userData = response.data; // Düzgün səviyyədə məlumatı götür
      if (this.userData.birthDate) {
        this.userData.birthDate = new Date(this.userData.birthDate); // Tarixi çevirmək
      }

      if (this.userData.userRole === 1) {
        this.userData.userRole = 'Admin';
      } else if (this.userData.userRole === 2) {
        this.userData.userRole = 'Moderator';
      } else {
        this.userData.userRole = 'Naməlum';
      }
      this.editData = { ...this.userData };
    },
    error: (error) => {
      console.error('Xəta baş verdi:', error);
    },
  });
  }

  updateUser(): void {
    const payload = {
      id: this.userData.id, // Backend üçün istifadəçinin ID-si
      name: this.editData.name,
      surname: this.editData.surname,
      fathersName: this.editData.fathersName,
      email: this.editData.email,
      userRole: this.editData.userRole, // İstifadəçi rolu

    };

    const token = localStorage.getItem('authToken'); // Tokeni götür
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // Tokeni header-ə əlavə et
    });

    this.http
      .put(`http://localhost:5245/api/Auth/updateme`, payload, { headers })
      .subscribe({
        next: (response) => {
          console.log('İstifadəçi uğurla redaktə edildi:', response);
          this.userData = { ...this.editData }; // Məlumatları yenilə
          this.editMode = false; // Redaktə rejimini bağla
          alert('Məlumatlar uğurla yeniləndi!');
        },
        error: (error) => {
          console.error('İstifadəçi redaktə edilərkən xəta baş verdi:', error);
          alert('Məlumatları yeniləmək mümkün olmadı!');
        },
      });
  }

 

formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-'); // `YYYY-MM-DD` formatını parçaladıq
  return `${day}.${month}.${year}`; // `DD.MM.YYYY` formatında qaytarırıq
}
  
}
