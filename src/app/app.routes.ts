import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { FaqComponent } from './faq/faq.component';
import { ProjectsComponent } from './projects/projects.component';
import { TemplateComponent } from './my_template/template.component';
import { RegisterComponent } from './account/register/register.component';
import { ResumeShareComponent } from './resume-share/resume-share.component';
import { ProjectManagementComponent } from './project-management/project-management.component';
import { ResumeViewComponent } from './resume-view/resume-view.component';

// Define your routes here
export const routes: Routes = [
  { path: '', component: HomeComponent }, // Default route
  { path: 'about', component: AboutComponent }, // Route to "About" page
  { path: 'projects', component: ProjectsComponent }, // Route to "Projects" page
  { path: 'faq', component: FaqComponent }, // Route to "FAQ" page
  { path: 'signup', component: RegisterComponent }, // Route to "Signup" page
  { path: 'user/:id', component: TemplateComponent },
  { path: 'user/:id/projects', component: ProjectManagementComponent }, // User's projects with template header
  { path: 'resumes', component: ResumeShareComponent }, // Route to "Resume Sharing" page
  { path: 'resume/:id', component: ResumeViewComponent }, // Route to individual resume view
  { path: 'manage-projects', component: ProjectManagementComponent } // Route to "Project Management" page
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
