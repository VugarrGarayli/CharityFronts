import { HttpClient } from "@angular/common/http";
import { Component, ElementRef, Renderer2 } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
interface Volunteer {
  id: number;
  name: string;
  surname: string;
  fathersName: string;
  birthDate: string;
  phoneNumber: string;
  email: string;
  address: string;
  uploadFileId: string;
  fileUrl: string;
}

@Component({
  selector: "app-volunteer",
  templateUrl: "./volunteer.component.html",
  styleUrl: "./volunteer.component.scss",
})
export class VolunteerComponent {
  volunteerForm!: FormGroup;
  imagePreview: string | null = null;
  isLoading: boolean = false;
  showNotification:boolean = false;
  notificationMessage: string = "";
  showModul = false;  // Modalı idarə etmək üçün bayraq
  isFormChanged = false; 
  
  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {

     // Formun dəyişilməsini izləmək üçün
  
  }

  ngOnInit(): void {
    // Formun yaratılması
    this.volunteerForm = this.fb.group({
      name: [
        "",
        [
          Validators.required,
          Validators.pattern(/^[A-Za-z\u018F\u0259üöçşığ]+$/),
        ],
      ],
      surname: [
        "",
        [
          Validators.required,
          Validators.pattern(/^[A-Za-z\u018F\u0259üöçşığ]+$/),
        ],
      ],
      fathersName: ["", [Validators.required]],
      birthDate: ["", [Validators.required]],
      phoneNumber: [
        "",
        [Validators.required, Validators.pattern(/^\+?[0-9]{10,15}$/)],
      ],
      email: ["", [Validators.required, Validators.email]],
      address: ["", [Validators.required]],
      uploadFileId: [null, [Validators.required]],
    });

    this.volunteerForm.valueChanges.subscribe(() => {
      this.isFormChanged = true;
    });
  }
  
  // Formu submit etmək üçün funksiya
  onSubmit(): void {
    if (this.volunteerForm.invalid) {
      alert("Form məlumatlarını düzgün doldurun.");
      return;
    }

    const formValues = this.volunteerForm.value;
    const volunteerData = {
      name: formValues.name,
      surname: formValues.surname,
      fathersName: formValues.fathersName,
      birthDate: formValues.birthDate,
      phoneNumber: formValues.phoneNumber,
      email: formValues.email,
      address: formValues.address,
      uploadFileId: formValues.uploadFileId,
    };

    this.isLoading = true;

    this.http
      .post("http://localhost:5245/api/Volunteer", volunteerData)
      .subscribe(
        (response) => {
          this.isLoading = false;
          this.resetForm();
          this.showNotificationMessage("Məlumatlar uğurla göndərildi");
        },
        (error) => {
          console.error("Error while adding volunteer:", error);
          this.isLoading = false;
          alert("Məlumatlar göndərilərkən xəta baş verdi.");
        }
      );

      
  }

  // Şəkil seçilməsi üçün funksiya
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (allowedTypes.includes(file.type)) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreview = e.target.result;
        };
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append("file", file);

        this.http
          .post("http://localhost:5245/api/UploadFile", formData)
          .subscribe(
            (response: any) => {
              this.volunteerForm.patchValue({ uploadFileId: response.data.id });
              console.log("File uploaded successfully:", response);
            },
            (error) => {
              console.error("Error uploading file:", error);
              alert("Şəkil yüklənərkən xəta baş verdi.");
            }
          );
      } else {
        alert("Yalnız .jpg, .png, .jpeg formatlarında şəkillər qəbul edilir.");
        this.volunteerForm.get("uploadFileId")?.reset();
        this.imagePreview = null;
      }
    }
  }

  openModal(): void {
    if (this.isFormChanged) {
      this.showModul = true;  // Modalı göstər
    }
  }

  // Modalı bağlamaq üçün
  closeModal(confirm: boolean): void {
    if (confirm) {
      this.resetForm();  // Formu sıfırlayırıq
    }
    this.showModul = false;  // Modalı bağlayırıq
  }

  // Formun sıfırlanması üçün funksiya
  resetForm(): void {
    this.volunteerForm.reset();
    this.imagePreview = null;
  }

  showNotificationMessage(message: string): void {
    this.notificationMessage = message;
    this.showNotification = true;
    setTimeout(() => {
      this.showNotification = false;
      this.router.navigate(['/']); // Əsas səhifəyə yönləndirmək
    }, 4000);
  }
}
