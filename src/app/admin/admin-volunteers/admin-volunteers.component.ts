import { Component, ElementRef, HostListener, Renderer2 } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import jwt_decode from "jwt-decode";

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
  selector: "app-admin-volunteers",
  templateUrl: "./admin-volunteers.component.html",
  styleUrls: ["./admin-volunteers.component.scss"],
})
export class AdminVolunteersComponent {
  volunteerForm: FormGroup;
  showForm: boolean = false;
  volunteers: Volunteer[] = [];
  imagePreview: string | ArrayBuffer | null = null;
  editingIndex: number | null = null;
  showConfirmation: boolean = false;
  confirmationMessage: string = "";
  actionConfirmed: boolean = false;
  isModalOpen = false;
  selectedVolunteer: any;
  page: number = 1;
  limit: number = 8;
  totalDataCount: number = 0;
  isAdmin = false;
  isModerator = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private renderer: Renderer2,
    private el: ElementRef,
    private router: Router,
    private authService: AuthService
  ) {
    this.volunteerForm = this.fb.group({
      name: [
        "",
        [
          Validators.required,
          Validators.pattern(/^[a-zA-ZüÜəƏıİöÖğĞçÇşŞ\s]+$/),
        ],
      ],
      surname: [
        "",
        [
          Validators.required,
          Validators.pattern(/^[a-zA-ZüÜəƏıİöÖğĞçÇşŞ\s]+$/),
        ],
      ],
      fathersName: [""],
      birthDate: [""],
      phoneNumber: [
        "",
        [Validators.required, Validators.pattern(/^(\+994|0)[1-9][0-9]{8}$/)],
      ],
      email: ["", [Validators.required, Validators.email]],
      address: [""],
      uploadFileId: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.loadVolunteers();

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

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  loadVolunteers() {
    const params = new HttpParams()
      .set("page", this.page.toString())
      .set("limit", this.limit.toString());

    this.http
      .get<{
        data: { datas: Volunteer[]; totalDataCount: number };
        isSuccess: boolean;
      }>("http://localhost:5245/api/Volunteer", { params })
      .subscribe(
        (response) => {
          if (response.isSuccess && Array.isArray(response.data.datas)) {
            this.volunteers = response.data.datas.map((volunteer) => ({
              ...volunteer,
              birthDate: new Date(volunteer.birthDate)
                .toISOString()
                .split("T")[0],
            }));
            this.totalDataCount = response.data.totalDataCount;
          } else {
            console.error("Unexpected response format:", response);
          }
        },
        (error) => {
          console.error("Error loading volunteers", error);
        }
      );
  }

  get totalPages(): number {
    return Math.ceil(this.totalDataCount / this.limit);
  }

  get paginationPages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    console.log("Səhifələr:", pages);
    return pages;
  }
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.page = page;
      this.loadVolunteers();
      window.scrollTo(0, 0);
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadVolunteers();
      window.scrollTo(0, 0);
    }
  }

  previousPage() {
    if (this.page > 1) {
      this.page--;
      this.loadVolunteers();
      window.scrollTo(0, 0);
    }
  }

  onSubmit() {
    if (this.volunteerForm.invalid) {
      return;
    }

    const formValues = this.volunteerForm.value;
    const updatedVolunteer = {
      id:
        this.editingIndex !== null
          ? this.volunteers[this.editingIndex].id
          : undefined,
      name: formValues.name,
      surname: formValues.surname,
      fathersName: formValues.fathersName,
      birthDate: formValues.birthDate,
      phoneNumber: formValues.phoneNumber,
      email: formValues.email,
      address: formValues.address,
      uploadFileId: formValues.uploadFileId,
    };

    if (this.editingIndex !== null) {
      this.http
        .put(`http://localhost:5245/api/Volunteer`, updatedVolunteer)
        .subscribe(
          (response) => {
            console.log("Volunteer updated", response);

            this.loadVolunteers();
            this.toggleForm();
          },
          (error) => {
            console.error("Error updating volunteer", error);
          }
        );
      this.editingIndex = null;
    } else {
      setTimeout(() => {
        this.http
          .post("http://localhost:5245/api/Volunteer", updatedVolunteer)
          .subscribe(
            (response) => {
              console.log("Volunteer added", response);
              this.loadVolunteers();

              this.toggleForm();
              this.resetForm();
            },
            (error) => {
              console.error("Error adding volunteer", error);
            }
          );
      }, 1000);
    }
  }

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
            },
            (error) => {
              console.error("Error uploading image", error);
            }
          );
      } else {
        alert("Only .jpg, .png, .jpeg formats are accepted.");
        this.volunteerForm.get("imageUrl")?.reset();
        this.imagePreview = null;
      }
    }
  }

  deleteVolunteer(index: number) {
    this.showConfirmationModal("Silmək istədiyinizdən əminsiz?", () => {
      const volunteer = this.volunteers[index];

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
      this.http
        .delete(`http://localhost:5245/api/Volunteer/${volunteer.id}`)
        .subscribe(
          (response) => {
            console.log("Volunteer deleted", response);
            this.loadVolunteers();
          },
          (error) => {
            console.error("Error deleting volunteer", error);
          }
        );
    });
  }

  showConfirmationModal(message: string, callback: () => void) {
    this.confirmationMessage = message;
    this.showConfirmation = true;

    this.confirmAction = (confirmed: boolean) => {
      this.showConfirmation = false;
      if (confirmed) {
        callback();
      }
    };
  }

  confirmAction(confirmed: boolean) {}

  openEditForm(index: number) {
    const globalIndex = (this.page - 1) * this.limit + index;
    this.editingIndex = globalIndex;
    const volunteer = this.volunteers[globalIndex];
    this.volunteerForm.patchValue(volunteer);
    this.showForm = true;
    this.imagePreview = this.getImageUrl(volunteer.fileUrl);
  }
  getImageUrl(fileUrl: string | null): string {
    return fileUrl ? fileUrl : "";
  }

  resetForm() {
    this.volunteerForm.reset();
    this.editingIndex = null;
    this.imagePreview = null;
  }
  onCancel() {
    this.showForm = false;
    this.volunteerForm.reset();
    this.editingIndex = null;
  }

  exitForm() {
    this.router.navigate(["/volunteers"]);
  }

  openDetailModal(volunteer: any) {
    this.selectedVolunteer = volunteer;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
}
