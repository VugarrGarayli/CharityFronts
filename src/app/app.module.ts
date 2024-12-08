import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from "ngx-mask";
import { RouterModule } from "@angular/router";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { HeaderComponent } from "./components/header/header.component";
import { FooterComponent } from "./components/footer/footer.component";
import { AboutUsComponent } from "./components/about-us/about-us.component";
import { HomeComponent } from "./pages/home/home.component";
import { BlogComponent } from "./pages/blog/blog.component";
import { ContactUsComponent } from "./pages/contact-us/contact-us.component";
import { GalleryComponent } from "./pages/gallery/gallery.component";
import { ServicesComponent } from "./pages/services/services.component";
import { VolunteerComponent } from "./pages/volunteer/volunteer.component";
import { CarouselModule } from "ngx-bootstrap/carousel";
import { AdminLoginComponent } from "./admin/admin-login/admin-login.component";
import { AdminDashboardComponent } from "./admin/admin-dashboard/admin-dashboard.component";
import { AdminProjectsComponent } from "./admin/admin-projects/admin-projects.component";
import { AdminRequestsComponent } from "./admin/admin-requests/admin-requests.component";
import { FormsModule } from "@angular/forms";
import { AdminSidebarComponent } from "./admin/admin-sidebar/admin-sidebar.component";
import { AdminGalleryComponent } from "./admin/admin-gallery/admin-gallery.component";
import { AdminBlogsComponent } from "./admin/admin-blogs/admin-blogs.component";
import { AdminVolunteersComponent } from "./admin/admin-volunteers/admin-volunteers.component";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { MatDialogModule } from "@angular/material/dialog"; // MatDialog üçün lazımdır
import { MatButtonModule } from "@angular/material/button"; // Dialog düymələri üçün lazımdır
import { HttpClientModule } from "@angular/common/http";
import { AdminLayoutComponent } from "./admin/admin-layout/admin-layout.component";
import { NotificationComponent } from "./shared/notification/notification.component";
import { AdminPagesComponent } from "./admin/admin-pages/admin-pages.component";
import { ChangePasswordComponent } from "./change-password/change-password.component";
import { SessionUserComponent } from "./admin/session-user/session-user.component";
import { AuthGuard } from "./guards/auth.guard";
import { DatePipe } from "@angular/common";


//import { AdminPagesComponent } from './admin/admin-pages/admin-pages.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    AboutUsComponent,
    HomeComponent,
    BlogComponent,
    ContactUsComponent,
    GalleryComponent,
    ServicesComponent,
    VolunteerComponent,
    AdminLoginComponent,
    AdminDashboardComponent,
    AdminProjectsComponent,
    AdminRequestsComponent,
    AdminSidebarComponent,
    AdminGalleryComponent,
    AdminBlogsComponent,
    AdminVolunteersComponent,
    AdminLayoutComponent,
    NotificationComponent,
    AdminPagesComponent,
    ChangePasswordComponent,
    SessionUserComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    MatDialogModule,
    MatButtonModule,
    BrowserModule,
    AppRoutingModule,
    CarouselModule.forRoot(),
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [provideNgxMask(), provideAnimationsAsync(), DatePipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
