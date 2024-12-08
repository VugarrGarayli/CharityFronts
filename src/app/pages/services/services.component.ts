import { Component } from "@angular/core";
import { Location } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { FormGroup } from "@angular/forms";
import { HttpClient, HttpParams } from "@angular/common/http";
interface Project {
  id: number;
  createdDate: string;
  header: string;
  uploadFileId: string;
  content: string;
  fileUrl: string;
}

@Component({
  selector: "app-services",
  templateUrl: "./services.component.html",
  styleUrl: "./services.component.scss",
})
export class ServicesComponent {
 
  projects: Project[] = [];
  projectForm: FormGroup;
  page = 1;
  limit = 8;
  totalDataCount = 0;
  constructor(private location: Location, private http: HttpClient) {}

  selectedEvent: Project | null = null;

  ngOnInit() {
    this.loadProjects();
  }

  // Layihələri API-dən yüklə
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
  // Method to select an event and view its details
  selectEvent(event: Project) {
    this.selectedEvent = event;
    window.scrollTo(0, 0);
    history.pushState(null, "", location.href); // Scroll to the top when the new page is loaded
  }

  // Method to deselect the event and return to the event list
  deselectEvent() {
    this.selectedEvent = null;
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
}
