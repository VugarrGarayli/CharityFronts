import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { GalleryService } from "../../gallery.service";
import { HttpClient, HttpParams } from "@angular/common/http";
interface Gallery {
  id: number;
  createdDate: string;
  uploadFileId: string;
  fileUrl: string;
}
@Component({
  selector: "app-gallery",
  templateUrl: "./gallery.component.html",
  styleUrl: "./gallery.component.scss",
})
export class GalleryComponent {
  galleryForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  imageError: string | null = null;
  showForm = false;
  galleries: Gallery[] = [];
  selectedEvent: Gallery | null = null;
  totalDataCount = 0;
  selectedGallery: any;
  page = 1;
  limit = 20;
  private apiUrl = "http://localhost:5245/api/Gallery";

  constructor(
    private fb: FormBuilder,
    private galleryService: GalleryService,
    private http: HttpClient
  ) {}
  ngOnInit() {
    this.loadGalleries();
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

            console.log("Gələn Şəkillər:", this.galleries.length);
            console.log("Cəmi Məlumat Sayı:", this.totalDataCount);
          } else {
            console.error("Gözlənilməyən cavab formatı:", response);
          }
        },
        (error) => {
          console.error("Şəkillər gətirilərkən xəta baş verdi", error);
        }
      );
  }


  openModal(gallery) {
    this.selectedGallery = gallery;
  }

  // Modalı bağlamaq
  closeModal() {
    this.selectedGallery = null;
  }
}
