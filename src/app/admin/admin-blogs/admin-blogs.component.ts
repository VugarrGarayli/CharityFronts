import { Component, ElementRef, HostListener, Renderer2 } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpClient, HttpParams } from "@angular/common/http";
import { AuthService } from "../../services/auth.service";
import jwt_decode from "jwt-decode";

interface Blog {
  id: number;
  createdDate: string;
  header: string;
  uploadFileId: string;
  content: string;
  fileUrl: string;
}

@Component({
  selector: "app-admin-blogs",
  templateUrl: "./admin-blogs.component.html",
  styleUrls: ["./admin-blogs.component.scss"],
})
export class AdminBlogsComponent {
  blogForm: FormGroup;
  showForm: boolean = false;
  imageError: boolean = false;
  editingIndex: number | null = null;
  showConfirmation: boolean = false;
  confirmationMessage: string = "";
  isExpanded: boolean[] = [];
  blogs: Blog[] = [];
  showDetailView: boolean = false; // Detallı səhifənin görünürlüğünü idarə edir
  selectedProject: Blog | null = null;
  showDetailsModal: boolean = false;
  currentProject: Blog | null = null;
  optionsVisible: boolean[] = [];
  imagePreview: string | ArrayBuffer | null = null;
  searchTerm: string = "";
  filteredBlogs: Blog[] = [];
  page = 1;
  limit = 2;
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
    this.blogForm = this.fb.group({
      header: [
        "",
        [
          Validators.required,
          Validators.pattern(/^[a-zA-ZüÜəƏıİöÖğĞçÇşŞ\s]+$/),
        ],
      ],
      uploadFileId: ["", Validators.required],
      content: ["", Validators.required],
    });
  }

  ngOnInit() {
    this.loadBlogs();

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

  loadBlogs() {
    const params = new HttpParams()
      .set("page", this.page.toString())
      .set("limit", this.limit.toString());
    this.http
      .get<{
        data: { datas: Blog[]; totalDataCount: number };
        isSuccess: boolean;
      }>("http://localhost:5245/api/Blog", { params })
      .subscribe(
        (response) => {
          if (response.isSuccess && Array.isArray(response.data.datas)) {
            this.blogs = response.data.datas;
            this.totalDataCount = response.data.totalDataCount;
            this.filteredBlogs = this.blogs;

            console.log("Gələn Layihələr:", this.blogs.length);
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

  searchBlogs() {
    if (this.searchTerm.trim() === "") {
      this.filteredBlogs = this.blogs; // If search is cleared, show all projects
    } else {
      this.filteredBlogs = this.blogs.filter((project) =>
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
      this.loadBlogs();
      window.scrollTo(0, 0);
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadBlogs();
    }
    window.scrollTo(0, 0);
  }

  previousPage() {
    if (this.page > 1) {
      this.page--;
      this.loadBlogs();
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

  // onSubmit() {
  //   if (this.blogForm.invalid) return;
  //   const formValues = this.blogForm.value;
  //   const updatedBlog = {
  //     id:
  //       this.editingIndex !== null
  //         ? this.blogs[this.editingIndex].id
  //         : undefined,
  //     header: formValues.header,
  //     uploadFileId: formValues.uploadFileId,
  //     content: formValues.content,
  //   };

  //   if (this.editingIndex !== null) {
  //     this.showConfirmationModal("Redaktə etmək istəyirsiniz?", () => {
  //       this.http.put("http://localhost:5245/api/Blog", updatedBlog).subscribe(
  //         (response) => {
  //           console.log("Blog yeniləndi", response);
  //           this.loadBlogs();
  //           this.closeForm();
  //         },
  //         (error) => console.error("Blog yenilənərkən xəta baş verdi", error)
  //       );
  //       this.editingIndex = null;
  //     });
  //   } else {
  //     this.showConfirmationModal("Əlavə etmək istəyirsiniz?", () => {
  //       this.http.post("http://localhost:5245/api/Blog", updatedBlog).subscribe(
  //         (response) => {
  //           console.log("Blog əlavə edildi", response);
  //           this.loadBlogs();
  //           this.closeForm();
  //         },
  //         (error) => console.error("Blog əlavə edilərkən xəta baş verdi", error)
  //       );
  //     });
  //   }
  // }

  onSubmit() {
    if (this.blogForm.invalid) {
      return;
    }

    const formValues = this.blogForm.value;

    // Yeni və ya redaktə edilmiş layihəni hazırlamaq
    const updatedProject = {
      id:
        this.editingIndex !== null
          ? this.blogs[this.editingIndex].id
          : undefined,
      header: formValues.header,
      uploadFileId: formValues.uploadFileId,
      content: formValues.content, // Burada məzmunu olduğu kimi göndəririk
    };

    // Layihə redaktə edilirsə
    if (this.editingIndex !== null) {
      this.showConfirmationModal("Redaktə etmək istəyirsiniz?", () => {
        this.http
          .put("http://localhost:5245/api/Blog", updatedProject)
          .subscribe(
            (response) => {
              console.log("Layihə yeniləndi", response);
              this.loadBlogs(); // Layihələri yenilə
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
          .post("http://localhost:5245/api/Blog", updatedProject)
          .subscribe(
            (response) => {
              console.log("Layihə əlavə edildi", response);
              this.loadBlogs(); // Layihələri yenilə
              this.closeForm(); // Formu bağla
              this.blogForm.reset(); // Formu sıfırla
              this.imagePreview = null; // Formu sıfırla

              this.page = 1;
              this.loadBlogs();
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

  deleteBlog(index: number) {
    this.showConfirmationModal("Silmək istədiyinizdən əminsiz?", () => {
      const blog = this.blogs[index];

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
        .delete(`http://localhost:5245/api/Blog/${blog.id}`, { headers })
        .subscribe(
          (response) => {
            console.log("Blog silindi", response);
            this.loadBlogs();
          },
          (error) => console.error("Blog silinərkən xəta baş verdi", error)
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
              this.blogForm.patchValue({ uploadFileId: response.data.id });
            },
            (error) => {
              console.error("Şəkil yüklənərkən xəta baş verdi", error);
            }
          );
      } else {
        alert("Yalnız .jpg, .png, .jpeg formatlarında fayllar qəbul edilir.");
        this.blogForm.get("uploadFileId")?.reset();
        this.imagePreview = null;
      }
    }
  }

  toggleContent(index: number) {
    this.isExpanded[index] = !this.isExpanded[index];
  }

  getShortContent(content: string, index: number): string {
    return this.isExpanded[index] ? content : content.substring(0, 100) + "...";
  }

  viewDetails(i: number) {
    this.currentProject = this.blogs[i]; // Layihəni alırıq
    this.showDetailsModal = true; // Modalı göstəririk
  }

  // Detallı baxış pəncərəsini bağla
  closeDetailsModal() {
    this.showDetailsModal = false; // Modalı bağlayırıq
    this.currentProject = null; // Layihəni sıfırlayırıq
  }

  openEditForm(index: number) {
    const globalIndex = (this.page - 1) * this.limit + index;
    this.editingIndex = globalIndex;
    const blog = this.blogs[globalIndex];
    this.blogForm.patchValue(blog);
    this.showForm = true;

    // Əvvəldən əlavə olunmuş şəkli önizləmə üçün təyin edin
    this.imagePreview = this.getImageUrl(blog.fileUrl);
  }

  openAddForm() {
    this.resetForm();
    this.showForm = true;
  }

  onCancel() {
    this.showForm = false;
    this.blogForm.reset();
    this.editingIndex = null;
  }

  // Yeni metod olaraq resetForm funksiyasını əlavə edin
  resetForm() {
    this.blogForm.reset();
    this.editingIndex = null;
    this.imagePreview = null;
  }

  closeForm() {
    this.showForm = false;
    this.blogForm.reset();
  }

  confirmAction(confirmed: boolean) {}
}
