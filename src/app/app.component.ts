import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "./services/auth.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {
  title = "CharityProject";

  isAdminPage: boolean = false; // Başlanğıc dəyəri təyin edin

  constructor(private router: Router, private authService: AuthService) {
    this.router.events.subscribe(() => {
      this.isAdminPage = this.router.url.startsWith("/admin");
    });
  }


  get isAdmin() {
    return this.authService.isAdmin();
  }

  get isModerator() {
    return this.authService.isModerator();
  }

  // logout() {
  //   this.authService.logout();
  // }
}
