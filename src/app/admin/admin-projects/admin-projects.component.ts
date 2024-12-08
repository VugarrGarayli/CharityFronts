import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Component, ElementRef, HostListener, Renderer2 } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import jwt_decode from "jwt-decode";

interface Project {
  id: number;
  createdDate: string;
  header: string;
  uploadFileId: string;
  content: string;
  fileUrl: string;
}

@Component({
  selector: "app-admin-projects",
  templateUrl: "./admin-projects.component.html",
  styleUrls: ["./admin-projects.component.scss"],
})
export class AdminProjectsComponent {
  projectForm: FormGroup;
  imageError: boolean = false;
  showForm: boolean = false;
  editingIndex: number | null = null;
  showConfirmation: boolean = false;
  confirmationMessage: string = "";
  actionConfirmed: boolean = false;
  isExpanded: boolean[] = [];
  projects: Project[] = [];
  optionsVisible: boolean[] = [];
  imagePreview: string | ArrayBuffer | null = null;
  showDetailView: boolean = false;
  selectedProject: Project | null = null;
  showDetailsModal: boolean = false;
  currentProject: Project | null = null;
  searchTerm: string = "";
  filteredProjects: Project[] = [];
  page = 1;
  limit = 8;
  totalDataCount = 0;
  isAdmin = false;
  isModerator = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private renderer: Renderer2,
    private el: ElementRef,
    private authService: AuthService
  ) {
    this.projectForm = this.fb.group({
      header: [
        "",
        [
          //Validators.required,
          //Validators.pattern(/^[a-zA-ZüÜəƏıİöÖğĞçÇşŞ\s]+$/),
        ],
      ],
      uploadFileId: ["", Validators.required],
      content: ["", Validators.required],
    });
  }

  toggleOptions(i: number, event: MouseEvent): void {
    event.stopPropagation(); // Klik hadisəsinin üst səviyyəyə keçməsinin qarşısını alır

    // Həmin layihənin `optionsVisible` vəziyyətini tərsinə çeviririk
    this.optionsVisible[i] = !this.optionsVisible[i];
  }
  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent): void {
    // Əgər kliklənən yer `options-menu` içindədirsə, heç nə etməyək
    if (this.el.nativeElement.contains(event.target)) {
      this.optionsVisible = this.optionsVisible.map(() => false);
    }

    // Əgər kliklənən yer `options-menu` xaricindədirsə, bütün menyuları bağlayırıq
  }
  ngOnInit() {
    this.loadProjects();

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

  loadProjects() {
    const params = new HttpParams()
      .set("page", this.page.toString())
      .set("limit", this.limit.toString());

    this.http
      .get<{
        data: { datas: Project[]; totalDataCount: number };
        isSuccess: boolean;
      }>("http://localhost:5245/api/Project", { params })
      .subscribe(
        (response) => {
          if (response.isSuccess && Array.isArray(response.data.datas)) {
            this.projects = response.data.datas;
            this.totalDataCount = response.data.totalDataCount;
            this.filteredProjects = this.projects;

            console.log("Gələn Layihələr:", this.projects);
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

  searchProjects() {
    if (this.searchTerm.trim() === "") {
      this.filteredProjects = this.projects;
    } else {
      this.filteredProjects = this.projects.filter((project) =>
        project.header.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalDataCount / this.limit);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.page = page;
      console.log("Səhifəyə keçid:", page);
      this.loadProjects();
      window.scrollTo(0, 0);
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadProjects();
    }
    window.scrollTo(0, 0);
  }

  previousPage() {
    if (this.page > 1) {
      this.page--;
      this.loadProjects();
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

  onSubmit() {
    if (this.projectForm.invalid) {
      return;
    }

    const formValues = this.projectForm.value;

    // Yeni və ya redaktə edilmiş layihəni hazırlamaq
    const updatedProject = {
      id:
        this.editingIndex !== null
          ? this.projects[this.editingIndex].id
          : undefined,
      header: formValues.header,
      uploadFileId: formValues.uploadFileId,
      content: formValues.content, // Burada məzmunu olduğu kimi göndəririk
    };

    // Layihə redaktə edilirsə
    if (this.editingIndex !== null) {
      this.showConfirmationModal("Redaktə etmək istəyirsiniz?", () => {
        this.http
          .put("http://localhost:5245/api/Project", updatedProject)
          .subscribe(
            (response) => {
              console.log("Layihə yeniləndi", response);
              this.loadProjects(); // Layihələri yenilə
              this.closeForm(); // Formu bağla
            },
            (error) => {
              console.error("Layihə yenilənərkən xəta baş verdi", error);
            }
          );
      });
      this.editingIndex = null; // Redaktə tamamlandıqdan sonra `editingIndex` sıfırlanır
    } else {
      // Yeni layihə əlavə edilirsə
      this.showConfirmationModal("Əlavə etmək istəyirsiniz?", () => {
        this.http
          .post("http://localhost:5245/api/Project", updatedProject)
          .subscribe(
            (response) => {
              console.log("Layihə əlavə edildi", response);
              this.loadProjects(); // Layihələri yenilə
              this.closeForm(); // Formu bağla
              this.projectForm.reset(); // Formu temizlə
              this.imagePreview = null; // Formu

              this.page = 1;
              this.loadProjects();
            },
            (error) => {
              console.error("Layihə əlavə edilərkən xəta baş verdi", error);
            }
          );
      });
    }
  }

  getImageUrl(fileUrl: string | null): string {
    return fileUrl ? fileUrl : "";
  }

  deleteProject(index: number) {
    this.showConfirmationModal("Silmək istədiyinizdən əminsiz?", () => {
      const project = this.projects[index];
      
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("Token tapılmadı!");
        return;
      }

      // Authorization header əlavə edirik
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      this.http
        .delete(`http://localhost:5245/api/Project/${project.id}`)
        .subscribe(
          (response) => {
            console.log("Layihə silindi", response);
            this.loadProjects();
          },
          (error) => {
            console.error("Layihə silinərkən xəta baş verdi", error);
          }
        );
    });
  }
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (allowedTypes.includes(file.type)) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreview = e.target.result; // Şəkil önizləmə üçün məlumat
        };
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append("file", file);

        this.http
          .post("http://localhost:5245/api/UploadFile", formData)
          .subscribe(
            (response: any) => {
              // `uploadFileId` sahəsini `response.data.id` ilə yeniləyin
              this.projectForm.patchValue({ uploadFileId: response.data.id });
            },
            (error) => {
              console.error("Şəkil yüklənərkən xəta baş verdi", error);
            }
          );
      } else {
        alert("Yalnız .jpg, .png, .jpeg formatlarında fayllar qəbul edilir.");
        this.projectForm.get("uploadFileId")?.reset();
        this.imagePreview = null;
      }
    }
  }

  confirmAction(confirmed: boolean) {}

  get paginatedProjects() {
    const startIndex = (this.page - 1) * this.limit;
    const endIndex = startIndex + this.limit;
    return this.projects.slice(startIndex, endIndex);
  }

  getShortContent(content: string, index: number) {
    return this.isExpanded[index] ? content : content.slice(0, 100) + "...";
  }

  toggleContent(index: number) {
    this.isExpanded[index] = !this.isExpanded[index];
  }

  openEditForm(index: number) {
    const globalIndex = (this.page - 1) * this.limit + index;
    this.editingIndex = globalIndex;
    const project = this.projects[globalIndex];
    this.projectForm.patchValue(project);
    this.showForm = true;

    // Əvvəldən əlavə olunmuş şəkli önizləmə üçün təyin edin
    this.imagePreview = this.getImageUrl(project.fileUrl);
  }

  openAddForm() {
    this.resetForm();
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.projectForm.reset();
  }

  resetForm() {
    this.projectForm.reset();
    this.editingIndex = null;
    this.imagePreview = null;
  }

  onCancel() {
    this.showForm = false;
    this.projectForm.reset();
    this.editingIndex = null;
  }

  viewDetails(i: number) {
    this.currentProject = this.projects[i]; // Layihəni alırıq
    this.showDetailsModal = true; // Modalı göstəririk
  }

  // Detallı baxış pəncərəsini bağla
  closeDetailsModal() {
    this.showDetailsModal = false; // Modalı bağlayırıq
    this.currentProject = null; // Layihəni sıfırlayırıq
  }
}
