import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProjectService, Project, ProjectCreateData } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-project-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './project-management.component.html',
  styleUrls: ['./project-management.component.scss']
})
export class ProjectManagementComponent implements OnInit {
  projects: Project[] = [];
  loading = false;
  error = '';
  success = '';
  showAddForm = false;
  editingProject: Project | null = null;
  
  projectForm: FormGroup;
  
  projectService = inject(ProjectService);
  authService = inject(AuthService);
  fb = inject(FormBuilder);

  constructor() {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      technologies: ['', [Validators.required]],
      short_description: ['', [Validators.required, Validators.minLength(10)]],
      long_description: ['', [Validators.minLength(20)]],
      github_url: [''],
      live_url: [''],
      image_url: [''],
      status: ['completed', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadUserProjects();
  }

  loadUserProjects(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error = 'Please sign in to manage your projects.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.projectService.getUserProjects(currentUser.uid).subscribe({
      next: (projects) => {
        // Ensure technologies is always an array for each project
        this.projects = projects.map((project: any) => ({
          ...project,
          technologies: Array.isArray(project.technologies) 
            ? project.technologies 
            : (typeof project.technologies === 'string' 
              ? project.technologies.split(',').map((t: string) => t.trim())
              : [])
        }));
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading projects. Please try again.';
        this.loading = false;
        console.error('Error loading projects:', err);
      }
    });
  }

  showAddProjectForm(): void {
    this.showAddForm = true;
    this.editingProject = null;
    this.projectForm.reset({ status: 'completed' });
  }

  showEditProjectForm(project: Project): void {
    this.editingProject = project;
    this.showAddForm = true;
    this.projectForm.patchValue({
      name: project.name,
      technologies: project.technologies.join(', '),
      short_description: project.short_description,
      long_description: project.long_description,
      github_url: project.github_url,
      live_url: project.live_url,
      image_url: project.image_url,
      status: project.status
    });
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.editingProject = null;
    this.projectForm.reset();
    this.error = '';
    this.success = '';
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      this.error = 'Please fill in all required fields correctly.';
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error = 'Please sign in to manage projects.';
      return;
    }

    const formData = this.projectForm.value;
    const projectData: ProjectCreateData = {
      ...formData,
      userId: currentUser.uid
    };

    this.loading = true;
    this.error = '';
    this.success = '';

    if (this.editingProject) {
      // Update existing project
      this.projectService.updateProject(this.editingProject.id, projectData).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Project updated successfully!';
            this.loadUserProjects();
            this.cancelForm();
          } else {
            this.error = response.message || 'Failed to update project.';
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error updating project. Please try again.';
          this.loading = false;
          console.error('Error updating project:', err);
        }
      });
    } else {
      // Create new project
      this.projectService.createProject(projectData).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Project created successfully!';
            this.loadUserProjects();
            this.cancelForm();
          } else {
            this.error = response.message || 'Failed to create project.';
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error creating project. Please try again.';
          this.loading = false;
          console.error('Error creating project:', err);
        }
      });
    }
  }

  deleteProject(project: Project): void {
    if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
      this.loading = true;
      this.error = '';

      this.projectService.deleteProject(project.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Project deleted successfully!';
            this.loadUserProjects();
          } else {
            this.error = 'Failed to delete project.';
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error deleting project. Please try again.';
          this.loading = false;
          console.error('Error deleting project:', err);
        }
      });
    }
  }

  getCompletedProjects(): Project[] {
    return this.projects.filter(p => p.status === 'completed');
  }

  getInProgressProjects(): Project[] {
    return this.projects.filter(p => p.status === 'in-progress');
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
} 