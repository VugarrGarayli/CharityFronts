import { Component, ElementRef, Renderer2 } from "@angular/core";
import { DatePipe, Location } from "@angular/common";
import { FormBuilder, FormGroup } from "@angular/forms";
import { HttpClient, HttpParams } from "@angular/common/http";
export interface Blog {
  id: number;
  createdDate: string;
  header: string;
  uploadFileId: string;
  content: string;
  fileUrl: string;
}
@Component({
  selector: "app-blog",
  templateUrl: "./blog.component.html",
  styleUrl: "./blog.component.scss",
})
export class BlogComponent {
  blogForm: FormGroup;
  selectedBlog: Blog | null = null;
  blogs: Blog[] = [];

  imagePreview: string | ArrayBuffer | null = null;
  page = 1;
  limit = 2;
  totalDataCount = 0;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private renderer: Renderer2,
    private el: ElementRef,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.loadBlogs();
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

            console.log("Gələn Bloqlar:", this.blogs.length);
            console.log("Cəmi Məlumat Sayı:", this.totalDataCount);
          } else {
            console.error("Gözlənilməyən cavab formatı:", response);
          }
        },
        (error) => {
          console.error("Bloqlar gətirilərkən xəta baş verdi", error);
        }
      );
  }

  formatDate(date: string) {
    return this.datePipe.transform(date, "dd MMM yyyy"); // Tarixi "gün ay il" formatında göstərir
  }
  selectBlog(blog: Blog) {
    this.selectedBlog = blog;
    window.scrollTo(0, 0);
    history.pushState(null, "", location.href);
  }

  deselectBlog() {
    this.selectedBlog = null;
  }
}
