import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { HomeComponent } from './pages/home/home.component';
import { ServicesComponent } from './pages/services/services.component';
import { BlogComponent } from './pages/blog/blog.component';
import { ContactUsComponent } from './pages/contact-us/contact-us.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { VolunteerComponent } from './pages/volunteer/volunteer.component';
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminProjectsComponent } from './admin/admin-projects/admin-projects.component';
import { AdminRequestsComponent } from './admin/admin-requests/admin-requests.component';
import { AdminGalleryComponent } from './admin/admin-gallery/admin-gallery.component';
import { AdminVolunteersComponent } from './admin/admin-volunteers/admin-volunteers.component';
import { AdminBlogsComponent } from './admin/admin-blogs/admin-blogs.component';
import { AdminPagesComponent } from './admin/admin-pages/admin-pages.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { SessionUserComponent } from './admin/session-user/session-user.component';
import { AuthGuard } from './guards/auth.guard';  // AuthGuard-ı import et

const routes: Routes = [
  // Admin login route
  { path: 'admin-login', component: AdminLoginComponent },

  // Admin layout routes
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard], // Guard burada tətbiq olunur
    children: [
      { path: '', component: AdminDashboardComponent }, // Dashboard
      { path: 'projects', component: AdminProjectsComponent }, // Projects
      { path: 'gallery', component: AdminGalleryComponent }, // Gallery
      { path: 'blogs', component: AdminBlogsComponent }, // Blogs
      { path: 'admin-volunteers', component: AdminVolunteersComponent }, // Volunteers
      { path: 'help-requests', component: AdminRequestsComponent }, // Help Requests
      { path: 'admin-pages', component: AdminPagesComponent }, // Pages
      { path: 'change-password', component: ChangePasswordComponent },
      { path: 'user-profile', component: SessionUserComponent },
    ],
  },

  // Main site routes
  { path: 'about-us', component: AboutUsComponent },
  { path: 'home', component: HomeComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'blog', component: BlogComponent },
  { path: 'contact-us', component: ContactUsComponent },
  { path: 'gallery', component: GalleryComponent },
  { path: 'volunteer', component: VolunteerComponent },

  // Default and wildcard routes
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }, // Wildcard route for 404
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      onSameUrlNavigation: 'reload', // Bu parametr URL eyni olduqda səhifəni yenidən yükləyir
      useHash: false, // hash mode istifadə etmirik
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
