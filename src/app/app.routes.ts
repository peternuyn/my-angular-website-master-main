import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { FaqComponent } from './faq/faq.component';
import { ProjectsComponent } from './projects/projects.component';
import { TemplateComponent } from './my_template/template.component';
import { RegisterComponent } from './account/register/register.component';

// Define your routes here
export const routes: Routes = [
  { path: '', component: HomeComponent }, // Default route
  { path: 'about', component: AboutComponent }, // Route to "About" page
  { path: 'projects', component: ProjectsComponent }, // Route to "Projects" page
  { path: 'faq', component: FaqComponent }, // Route to "FAQ" page
  { path: 'signup', component: RegisterComponent }, // Route to "Signup" page
  { path: 'your-template', component: TemplateComponent }, // Route to "Your Template" page

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
