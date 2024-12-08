import { Component } from "@angular/core";
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from "@angular/animations";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
  animations: [
    trigger("formPopupAnimation", [
      state(
        "closed",
        style({
          opacity: 0,
          transform: "scale(0.8)",
        })
      ),
      state(
        "open",
        style({
          opacity: 1,
          transform: "scale(1)",
        })
      ),
      transition("closed => open", [animate("300ms ease-out")]),
      transition("open => closed", [animate("200ms ease-in")]),
    ]),
  ],
})
export class HeaderComponent {
  helpRequestForm:FormGroup;
  isMenuCollapsed = true;
  showModal: boolean = false;
  showForm = false;
  regions: any[] = []; // Regionlar üçün array
  selectedRegionId: number | null = null; // Seçilən regionun ID-si
  helpRequests: any[] = []; // Yardım istəkləri
  selectedRequest: any = null;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  showConfirmation: boolean = false;
  confirmationMessage: string = "";
  actionConfirmed: boolean = false;
  showNotification:boolean = false;
  notificationMessage: string = "";

  constructor(private http: HttpClient,private fb: FormBuilder,private router: Router) {}

  ngOnInit(): void {
    // Regionları yükləmək üçün API çağırışı
    this.getRegions().subscribe((regions) => {
      this.regions = regions;
    });

    this.helpRequestForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      fathersName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      regionId: [null, Validators.required],
      address: ['', Validators.required],
      shortInfo: ['', Validators.required],
    });
  }

  getRegions(): Observable<any[]> {
    return this.http.get<any[]>("http://localhost:5245/api/Cities");
  }

  // Yardım istəyi yaratmaq üçün POST metodunu çağırmaq
  postHelpRequest(): void {
    if (this.helpRequestForm.invalid) {
      alert('Form məlumatları düzgün deyil!');
      return;
    }

    const body = this.helpRequestForm.value;

    // Yardım istəyi göndərməyi təsdiqləmək üçün modalı göstəririk
    this.showConfirmationModal('Məlumatların düzgün olduğunu?', () => {
      this.http.post('http://localhost:5245/api/HelpRequest', body).subscribe(
        (response) => {
          console.log('Yardım istəyi göndərildi', response);
          this.resetForm();
          this.showNotificationMessage("Məlumatlar uğurla göndərildi");
        },
        (error) => {
          console.error('Yardım istəyi göndərilərkən xəta baş verdi', error);
        }
      );
    });
  }
  
  showNotificationMessage(message: string): void {
    this.notificationMessage = message;
    this.showNotification = true;
    setTimeout(() => {
      this.showNotification = false;
      this.router.navigate(['/']); // Əsas səhifəyə yönləndirmək
    }, 4000);
  }
  resetForm(): void {
    this.helpRequestForm.reset();
    this.selectedRegionId = null;
    this.showForm = false; // Formu gizləyirik
    this.showConfirmation = false; // Modalı bağlayırıq
  }

  // Yardım istəyi üçün region seçimi
  onRegionChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement; // Event target-ı HTMLSelectElement tipinə çeviririk
    this.selectedRegionId = Number(selectElement.value); // Stringi number-ə çevirmək üçün Number() istifadə et
  }

  // Yardım istəyi detallarını göstərmək
  showDetails(request: any): void {
    this.selectedRequest = request;
  }

  // Yardım istəyi detallarını bağlamaq
  closeDetails(): void {
    this.selectedRequest = null;
  }

  // Yardım istəyi silmək
  deleteRequest(request: any): void {
    this.showConfirmationModal("Silmək istədiyinizdən əminsiz?", () => {
      this.helpRequests = this.helpRequests.filter((r) => r !== request);
      const totalPages = Math.ceil(
        this.helpRequests.length / this.itemsPerPage
      );
      if (this.currentPage > totalPages) {
        this.currentPage = totalPages;
      }
    });
  }

  // Yardım istəyi göndərmək üçün təsdiq modalını göstərmək
  showConfirmationModal(message: string, callback: () => void): void {
    this.confirmationMessage = message;
    this.showConfirmation = true;
  
    this.confirmAction = (confirmed: boolean) => {
      if (confirmed) {
        callback(); // Əməliyyat təsdiqlənərsə, callback-ı işə salırıq
      }
      this.showConfirmation = false; // Modalı bağlayırıq
    };
  }

  confirmAction(confirmed: boolean): void {
    // Əməliyyatın təsdiqi
  }

  // Pagination üçün köməkçi metod
  get paginatedRequests() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.helpRequests.slice(start, end);
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  toggleComplete(request: any): void {
    request.completed = !request.completed;
  }
  openForm() {
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
  }
  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  validateNumber(event: KeyboardEvent) {
    const charCode = event.charCode;
    // Yalnız rəqəmlərin daxil edilməsinə icazə verilir (48-57 ASCII kodları)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
}
