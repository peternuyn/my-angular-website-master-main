import { Component, ElementRef, ViewChild, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectService, Project } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';

// Keep the old type for backward compatibility
type OldProject = {
  name: string;
  technologies: string;
  short_description: string;
  long_description: string;
};

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './projects.component.html',
})

export class ProjectsComponent implements OnInit {
  projects: (Project | OldProject)[] = []; 
  workingOnProjects: (Project | OldProject)[] = []; 
  selectedProject: any;
  loading = false;
  error = '';
  hasUserProjects = false;

  @ViewChild('modal')
  modal!: ElementRef;

  projectService = inject(ProjectService);
  authService = inject(AuthService);
  
  constructor() {
    // Initialize with demo projects
    this.initializeDemoProjects();
  }

  ngOnInit(): void {
    this.loadUserProjects();
  }

  private initializeDemoProjects(): void {
    this.projects = [
      {
        name: 'Scavenger Hunt Hosting Website',
        technologies: 'React, Tailwind, JS',
        short_description: 'Get hands on with React, Hooks and Tailwind',
        long_description: 'This is a long project description',
      },
      {
        name: 'TransLink Bus Routes Searcher',
        technologies: 'JS',
        short_description: 'Functional Programming focussed, API Fetching and Promise, Handling a tremendous amount of data from TransLink',
        long_description: 'This is a long project description',
      },
      {
        name: 'Project 1',
        technologies: 'Angular, TypeScript, HTML, CSS',
        short_description: 'This is a short project description',
        long_description: 'This is a long project description',
      },
    ];

    this.workingOnProjects = [
      {
        name: 'Scavenger Hunt Mobile App',
        technologies: 'React Native, Expo, TypeScript',
        short_description: 'Introduced to Expo, how to build a mobile app',
        long_description: 'There are some interesting features in this project such as scanning the QR code, and the app will show the location of the next clue. A map tracker of the user location and the location of the next clue.',
      }
    ];
  }

  loadUserProjects(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      // If no user is logged in, just show demo projects
      return;
    }

    this.loading = true;
    this.error = '';

    this.projectService.getUserProjects(currentUser.uid).subscribe({
      next: (projects) => {
        if (projects.length > 0) {
          // Replace demo projects with user's actual projects
          this.projects = projects.filter((p: Project) => p.status === 'completed');
          this.workingOnProjects = projects.filter((p: Project) => p.status === 'in-progress');
          this.hasUserProjects = true;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading projects. Please try again.';
        this.loading = false;
        console.error('Error loading projects:', err);
      }
    });
  }

  showModal(project: any) {
    this.selectedProject = project;
    this.modal.nativeElement.showModal();
  }

  closeModal() {
    this.modal.nativeElement.close();
  }

  getCurrentUser(): any {
    return this.authService.getCurrentUser();
  }

  // Helper method to check if a project is the new format
  isNewProjectFormat(project: Project | OldProject): project is Project {
    return 'id' in project && 'userId' in project;
  }

  // Helper method to get technologies as string for display
  getTechnologiesDisplay(project: Project | OldProject): string {
    if (this.isNewProjectFormat(project)) {
      return project.technologies.join(', ');
    }
    return project.technologies;
  }
}
