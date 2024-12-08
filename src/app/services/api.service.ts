import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  private baseUrl = "http://localhost:5245/api"; // Backend əsas URL

  constructor(private http: HttpClient) {}

  // Silmə funksiyası
  deleteItem(endpoint: string, id: number): Observable<any> {
    const token = localStorage.getItem("authToken"); // Tokeni əldə et
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // Tokeni başlığa əlavə et
    });

    const url = `${this.baseUrl}/${endpoint}/${id}`; // Tam URL qurulur
    return this.http.delete(url, { headers });
  }
}
