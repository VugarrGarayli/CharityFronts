import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class GalleryService {
  constructor(private http: HttpClient) {}

  // Şəkili yükləmək üçün metod
  uploadFile(file: File): Promise<any> {
    const formData = new FormData();

    // Gözlənilən bütün sahələri əlavə et
    formData.append("File", file);

    // Əgər backend-də başqa sahələr varsa, onları da burada əlavə et:
    // formData.append('otherField', 'value');

    return fetch("http://localhost:5245/api/UploadFile", {
      method: "POST",
      body: formData,
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((errorData) => {
          throw new Error(JSON.stringify(errorData));
        });
      }
      return response.json();
    });
  }

  // Şəkili yükləmək üçün id-ə əsasən fayl yükləmə
  downloadFile(id: number): Promise<Blob> {
    return fetch(`http://localhost:5245/api/UploadFile/download/${id}`, {
      method: "GET",
    }).then((response) => response.blob());
  }
}
