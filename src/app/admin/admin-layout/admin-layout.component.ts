import { Component, Renderer2, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-admin-layout",
  templateUrl: "./admin-layout.component.html",
  styleUrl: "./admin-layout.component.scss",
  encapsulation: ViewEncapsulation.None
})
export class AdminLayoutComponent {
  userName: string = "Admin";
  isCollapsed = true;
  isDarkMode = false;
  isUserMenuOpen = false;
  selectedMenuItem: string | null = null;
  isExpanded = false;
  isViewAllOpen = false;
  showNotification: boolean = false;
  notificationMessage: string = "";
  showModul = false; // Modalı idarə etmək üçün bayraq
  closeTimeout: any = null;

  constructor(private renderer: Renderer2, private router: Router) {
    // LocalStorage'dan istifadəçinin mövcud mövzusunu alırıq
    this.isDarkMode = JSON.parse(localStorage.getItem('isDarkMode') || 'false');
    if (this.isDarkMode) {
      this.renderer.addClass(document.body, 'dark-mode');
    } else {
      this.renderer.removeClass(document.body, 'dark-mode');
    }
  }

  toggleViewAll(panelId: number) {
    this[`isViewAllOpen${panelId}`] = !this[`isViewAllOpen${panelId}`];
  }

  changePassword() {
    this.router.navigate(["/admin/change-password"]);
  }

  showNotificationMessage(message: string): void {
    this.notificationMessage = message;
    this.showNotification = true;
    setTimeout(() => {
      this.showNotification = false;
      this.router.navigate(["/"]); // Əsas səhifəyə yönləndirmək
    }, 4000);
  }

  signOut() {
    // Hesabdan çıxma üçün lazımi əməliyyatlar
    console.log("Hesabdan çıxıldı.");
  }
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

  // toggleTheme() {
  //   this.isDarkMode = !this.isDarkMode;
  //   localStorage.setItem('isDarkMode', JSON.stringify(this.isDarkMode));
  //   if (this.isDarkMode) {
  //     this.renderer.addClass(document.body, 'dark-mode');
  //   } else {
  //     this.renderer.removeClass(document.body, 'dark-mode');
  //   }
  // }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('isDarkMode', JSON.stringify(this.isDarkMode));
    
    const body = document.body;
    const mainContent = document.querySelector('.main-content');
    const topPanel = document.querySelector('.top-panel');
    const sidebar = document.querySelector('.sidebar');
  
    if (this.isDarkMode) {
      this.renderer.addClass(body, 'dark-mode');
      if (mainContent) {
        this.renderer.addClass(mainContent, 'dark-mode');
      }
      if (topPanel) {
        this.renderer.addClass(topPanel, 'dark-mode');
      }
      if (sidebar) {
        this.renderer.addClass(sidebar, 'dark-mode');
      }
    } else {
      this.renderer.removeClass(body, 'dark-mode');
      if (mainContent) {
        this.renderer.removeClass(mainContent, 'dark-mode');
      }
      if (topPanel) {
        this.renderer.removeClass(topPanel, 'dark-mode');
      }
      if (sidebar) {
        this.renderer.removeClass(sidebar, 'dark-mode');
      }
    }
  }
  
  

  closeUserMenu() {
    // 2 saniyəlik gecikmə ilə menyunu bağlayırıq
    this.closeTimeout = setTimeout(() => {
      this.isUserMenuOpen = false;
    }, 200); // 2000 millisekund = 2 saniyə
  }

  cancelCloseMenu() {
    // Mouse geri gələndə bağlanma vaxtını ləğv edirik
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;

    if (this.isUserMenuOpen && this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }
  }

  selectMenuItem(item: string) {
    this.selectedMenuItem = item;
  }
}
