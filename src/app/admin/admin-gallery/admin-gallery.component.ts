import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpClient, HttpParams } from "@angular/common/http";
import { GalleryService } from "../../gallery.service";
import { AuthService } from "../../services/auth.service";
import jwt_decode from "jwt-decode";

interface Gallery {
  id: number;
  createdDate: string;
  uploadFileId: string;
  fileUrl: string;
}
@Component({
  selector: "app-admin-gallery",
  templateUrl: "./admin-gallery.component.html",
  styleUrls: ["./admin-gallery.component.scss"],
})
export class AdminGalleryComponent {
  galleryForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  imageError: string | null = null;
  showForm = false;
  galleries: Gallery[] = [];

  showConfirmation: boolean = false;
  confirmationMessage: string = "";
  totalDataCount = 0;
  page = 1;
  limit = 20;
  confirmAction: (confirmed: boolean) => void = () => {};
  private apiUrl = "http://localhost:5245/api/Gallery"; // API URL
  isAdmin = false; // Admin olub-olmadığını saxlamaq üçün dəyişən
  isModerator = false; // Moderator olub-olmadığını saxlamaq üçün dəyişən

  constructor(
    private fb: FormBuilder,
    private galleryService: GalleryService,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.galleryForm = this.fb.group({
      image: ["", Validators.required],
    });
  }
  ngOnInit() {
    this.loadGalleries();
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
  }

  closeForm() {
    this.showForm = false;
    this.imageError = null;
    this.galleryForm.reset();
    this.previewUrl = null;
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

  deleteImage(index: number) {
    this.showConfirmationModal("Silmək istədiyinizdən əminsiz?", () => {
      const gallery = this.galleries[index];

      // Token-i əldə edirik
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("Token tapılmadı!");
        return;
      }

      // Authorization header əlavə edirik
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // API çağırışı
      this.http
        .delete(`http://localhost:5245/api/Gallery/${gallery.id}`, { headers })
        .subscribe(
          (response) => {
            console.log("Layihə silindi", response);
            this.loadGalleries(); // Şəkil silindikdən sonra qalereyanı yenilə
          },
          (error) => {
            console.error("Layihə silinərkən xəta baş verdi", error);
          }
        );
    });
  }

  loadGalleries() {
    const params = new HttpParams()
      .set("page", this.page.toString())
      .set("limit", this.limit.toString());

    this.http
      .get<{
        data: { datas: Gallery[]; totalDataCount: number };
        isSuccess: boolean;
      }>(this.apiUrl, { params })
      .subscribe(
        (response) => {
          if (response.isSuccess && Array.isArray(response.data.datas)) {
            this.galleries = response.data.datas;
            this.totalDataCount = response.data.totalDataCount;

            console.log("Gələn Layihələr:", this.galleries.length);
            console.log("Cəmi Məlumat Sayı:", this.totalDataCount);
          } else {
            console.error("Gözlənilməyən cavab formatı:", response);
          }
        },
        (error) => {
          console.error("Layihələr gətirilərkən xəta baş verdi", error);
        }
      );
  }

  // Ümumi səhifə sayını hesabla
  get totalPages(): number {
    return Math.ceil(this.totalDataCount / this.limit);
  }
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.page = page;
      console.log("Səhifəyə keçid:", page);
      this.loadGalleries();
      window.scrollTo(0, 0);
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadGalleries();
    }
    window.scrollTo(0, 0);
  }

  previousPage() {
    if (this.page > 1) {
      this.page--;
      this.loadGalleries();
    }
    window.scrollTo(0, 0);
  }

  get paginationPages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    console.log("Səhifələr:", pages);
    return pages;
  }

  onFileChange(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        this.imageError = "Yalnız .jpg, .jpeg və .png formatları qəbul olunur.";
        return;
      }

      const maxSizeInMB = 5;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        this.imageError = `Faylın ölçüsü ${maxSizeInMB}MB-dan böyük ola bilməz.`;
        return;
      }

      this.selectedFile = file;
      this.imageError = null;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // POST metodu ilə şəkil yükləmək və dərhal yeniləmək
  async onSubmit() {
    if (!this.galleryForm.valid || !this.selectedFile) {
      this.imageError = "Zəhmət olmasa, bir şəkil seçin.";
      return;
    }

    const formData = new FormData();
    formData.append("file", this.selectedFile);

    try {
      const uploadResponse = await this.http
        .post<any>("http://localhost:5245/api/UploadFile", formData)
        .toPromise();

      const uploadFileId = uploadResponse.data.id;

      const galleryData = {
        uploadFileId: uploadFileId,
      };

      await this.http
        .post("http://localhost:5245/api/Gallery", galleryData)
        .toPromise();

      // Şəkilləri dərhal yenidən yükləyirik
      this.loadGalleries();
      this.resetForm();
      this.page = 1;
      this.loadGalleries();
    } catch (error) {
      console.error("Şəkil yüklənərkən xəta baş verdi:", error);
      this.imageError =
        "Şəkili yükləmək mümkün olmadı. Zəhmət olmasa, bir daha cəhd edin.";
    }
  }

  getImageUrl(fileUrl: string | null): string {
    return fileUrl ? fileUrl : "";
  }
  // Formu sıfırlamaq üçün metod
  resetForm() {
    this.selectedFile = null;
    this.previewUrl = null;
    this.showForm = false;
    this.galleryForm.reset();
  }

  // İmtina düyməsi üçün metod
  cancelForm() {
    this.resetForm();
  }
}
