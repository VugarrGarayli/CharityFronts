import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Component } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ApiService } from "../../services/api.service";
import { AuthService } from "../../services/auth.service";
import jwt_decode from "jwt-decode";

@Component({
  selector: "app-admin-pages",
  templateUrl: "./admin-pages.component.html",
  styleUrls: ["./admin-pages.component.scss"], // Düzgün yol adı
})
export class AdminPagesComponent {
  users: any[] = [];
  filteredUsers: any[] = [];
  searchTerm: string = "";
  isFormVisible: boolean = false;
  selectedUserIndex: number | null = null;
  apiUrl: string = "http://localhost:5245/api/User";
  firstName: string = "";
  lastName: string = "";
  fathersName: string = "";
  email: string = "";
  role: string = "moderator";
  isAdmin = false;
  isModerator = false;

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    const token = localStorage.getItem("authToken");
    if (token) {
      const decoded: any = jwt_decode(token);
      console.log(decoded); // Token-in içindəki məlumatları yoxlayaq
      // Token-dəki rola əsasən istifadəçi tipini təyin edirik
      if (
        decoded[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] === "1"
      ) {
        this.isAdmin = true;
      } else if (
        decoded[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] === "2"
      ) {
        this.isModerator = true;
      }
    }
  }

  loadUsers(): void {
    this.http.get<any>(this.apiUrl).subscribe(
      (response) => {
        if (
          response &&
          response.isSuccess &&
          response.data &&
          response.data.datas
        ) {
          this.users = response.data.datas;
          this.filteredUsers = [...this.users];
        } else {
          console.error("İstifadəçi məlumatları düzgün alınmadı:", response);
        }
      },
      (error) => {
        console.error("Xəta baş verdi:", error);
      }
    );
  }
  applyFilter(): void {
    if (this.searchTerm) {
      this.filteredUsers = this.users.filter(
        (user) =>
          user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || // Ad ilə axtarış
          user.surname.toLowerCase().includes(this.searchTerm.toLowerCase()) // Soyad ilə axtarış
      );
    } else {
      this.filteredUsers = [...this.users];
    }
    console.log("Filtered Users: ", this.filteredUsers); // Konsola filterlənmiş istifadəçiləri yaz
  }

  toggleForm(): void {
    this.isFormVisible = !this.isFormVisible;
    if (this.isFormVisible) {
      this.selectedUserIndex = null;
      this.firstName = "";
      this.lastName = "";
      this.fathersName = "";
      this.email = "";
      this.role = "moderator"; // default rol
    }
  }

  onSubmit(form: NgForm): void {
    if (form.valid) {
      const formData = form.value;
      const userRole = formData.role === "admin" ? 1 : 2;

      const userData = {
        name: formData.firstName,
        surname: formData.lastName,
        fathersName: formData.fathersName,
        password: "default_password", // Şifrəni daimi bir şey qoyduq
        userRole: userRole,
        email: formData.email,
      };

      if (this.selectedUserIndex !== null) {
        // PUT: Mövcud istifadəçini redaktə et
        this.updateUser(userData, this.users[this.selectedUserIndex].id);
      } else {
        // POST: Yeni istifadəçi əlavə et
        this.addUser(userData);
      }
      form.resetForm();
    }
  }

  addUser(userData: any): void {
    this.http.post(this.apiUrl, userData).subscribe(
      (response) => {
        this.loadUsers();
        this.toggleForm();
      },
      (error) => {
        console.error("İstifadəçi əlavə edilərkən xəta baş verdi: ", error);
      }
    );
  }

  updateUser(userData: any, userId: number): void {
    const payload = {
      id: userId,
      name: userData.name,
      surname: userData.surname,
      fathersName: userData.fathersName,
      email: userData.email,
      userRole: userData.userRole,
      password: userData.password,
    };

    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("Token tapılmadı!");
      alert("Sistemdən çıxmışsınız, zəhmət olmasa yenidən daxil olun.");
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http.put(`${this.apiUrl}`, payload, { headers }).subscribe(
      (response) => {
        console.log("İstifadəçi uğurla redaktə edildi:", response);
        this.loadUsers(); // Məlumatları yenilə
        this.toggleForm(); // Formu bağla
      },
      (error) => {
        console.error("İstifadəçi redaktə edilərkən xəta baş verdi: ", error);
      }
    );
  }

  onDelete(userId: number): void {
    if (confirm("Bu istifadəçini silmək istədiyinizə əminsiniz?")) {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("Token tapılmadı!");
        return;
      }

      // Authorization header əlavə edirik
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      this.apiService.deleteItem("User", userId).subscribe(
        (response) => {
          alert("İstifadəçi uğurla silindi.");

          this.users = this.users.filter((user) => user.id !== userId);
          this.filteredUsers = [...this.users];
        },
        (error) => {
          if (error.status === 401) {
            alert("Bu əməliyyatı yerinə yetirmək üçün səlahiyyətiniz yoxdur.");
          } else {
            console.error("Silinmə zamanı xəta baş verdi:", error);
            alert("İstifadəçini silmək mümkün olmadı.");
          }
        }
      );
    }
  }

  // İstifadəçini redaktə etmək üçün formu doldurmaq
  editUser(index: number): void {
    const user = this.users[index];
    this.selectedUserIndex = index; // Seçilən istifadəçini saxla
    this.firstName = user.name;
    this.lastName = user.surname;
    this.fathersName = user.fathersName;
    this.email = user.email;
    this.role = user.userRole === 1 ? "admin" : "moderator"; // admin və moderator arasında seçim

    this.isFormVisible = true; // Formu aç
  }
}
