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
    this.initializeDemoProjects();
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


}
