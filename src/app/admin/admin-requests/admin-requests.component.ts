import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Component } from "@angular/core";
import { Observable } from "rxjs";
import jwt_decode from "jwt-decode";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-admin-requests",
  templateUrl: "./admin-requests.component.html",
  styleUrls: ["./admin-requests.component.scss"],
})
export class AdminRequestsComponent {
  regions: any[] = []; // Regionlar üçün array
  selectedRegionId: number | null = null; // Seçilən regionun ID-si
  helpRequests: any[] = []; // Yardım istəkləri
  selectedRequest: any = null;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  showConfirmation: boolean = false;
  confirmationMessage: string = "";
  actionConfirmed: boolean = false;
  isAdmin = false;
  isModerator = false;

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    // Regionları yükləmək üçün API çağırışı
    this.loadHelpRequests();

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

  loadHelpRequests(): void {
    // Pagination üçün parametrləri əlavə edirik
    const params = new HttpParams()
      .set("page", this.currentPage.toString())
      .set("limit", this.itemsPerPage.toString());

    // Region filter varsa, onu da əlavə edirik
    if (this.selectedRegionId !== null) {
      params.set("regionId", this.selectedRegionId.toString());
    }

    // Yardım istəklərini almaq üçün HTTP GET sorğusu
    this.http
      .get<{
        data: { datas: any[]; totalDataCount: number }; // Gələn verilərin strukturunu buraya uyğunlaşdırırıq
        isSuccess: boolean;
      }>("http://localhost:5245/api/HelpRequest", { params })
      .subscribe(
        (response) => {
          if (response.isSuccess && Array.isArray(response.data.datas)) {
            this.helpRequests = response.data.datas;
            const totalDataCount = response.data.totalDataCount;

            console.log("Gələn Yardım İstəkləri:", this.helpRequests);
            console.log("Cəmi Yardım İstəyi Sayı:", totalDataCount);

            // Səhifələmə üçün totalDataCount ilə hesablamalar aparmaq
            const totalPages = Math.ceil(totalDataCount / this.itemsPerPage);
            if (this.currentPage > totalPages) {
              this.currentPage = totalPages; // Həddindən artıq səhifələr varsa, son səhifəyə gedirik
            }
          } else {
            console.error("Gözlənilməyən cavab formatı:", response);
          }
        },
        (error) => {
          console.error("Yardım İstəkləri gətirilərkən xəta baş verdi", error);
        }
      );
  }

  // Regionları API-dən almaq üçün metod
  getRegions(): Observable<any[]> {
    return this.http.get<any[]>("http://localhost:5245/api/Cities");
  }

  // Yardım istəyi yaratmaq üçün POST metodunu çağırmaq
  postHelpRequest(requestData: any): void {
    const regionId = this.selectedRegionId;

    if (regionId === null) {
      alert("Region seçilməyib!");
      return;
    }

    const body = {
      name: requestData.name,
      surname: requestData.surname,
      fathersName: requestData.fathersName,
      phoneNumber: requestData.phoneNumber,
      regionId: regionId, // Seçilmiş region ID-si
      address: requestData.address,
      shortInfo: requestData.shortInfo,
    };

    this.http.post("http://localhost:5245/api/HelpRequest", body).subscribe(
      (response) => {
        console.log("Yardım istəyi göndərildi", response);
        // Yeni yardım istəyi əlavə edildikdən sonra onu siyahıya əlavə et
        this.helpRequests.push(response);
      },
      (error) => {
        console.error("Yardım istəyi göndərilərkən xəta baş verdi", error);
      }
    );
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
    this.showConfirmationModal("Yardım istəyi silinsinmi?", () => {
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
        .delete(`http://localhost:5245/api/HelpRequest/${request.id}`)
        .subscribe(
          (response) => {
            console.log("Yardım istəyi silindi", response);
            this.loadHelpRequests(); // Yardım istəklərini yenidən yükləyirik
          },
          (error) => {
            console.error("Yardım istəyi silinərkən xəta baş verdi", error);
          }
        );
    });
  }

  // Yardım istəyi göndərmək üçün təsdiq modalını göstərmək
  showConfirmationModal(message: string, callback: () => void): void {
    this.confirmationMessage = message;
    this.showConfirmation = true;

    this.confirmAction = (confirmed: boolean) => {
      if (confirmed) {
        callback();
      }
      this.showConfirmation = false;
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
}
