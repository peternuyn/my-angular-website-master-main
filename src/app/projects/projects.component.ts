import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

type Project = {
  name: string;
  technologies: string;
  short_description: string;
  long_description: string;


};

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects.component.html',
})

export class ProjectsComponent {
  projects: Project[] = []; 
  workingOnProjects: Project[] = []; 
  selectedProject: any;

  @ViewChild('modal')
  modal!: ElementRef;

  
  constructor() {
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
        technologies: 'React Native, Expo, TypeScipt',
        short_description: 'Introduced to Expo, how to build a mobile app',
        long_description: 'There are some interesting features in this project such as scanning the QR code, and the app will show the location of the next clue. A map tracker of the user location and the location of the next clue.',
      }
     
    ];
  }

  showModal(project: any) {
    this.selectedProject = project;
    this.modal.nativeElement.showModal();
  }

  closeModal() {
    this.modal.nativeElement.close();
  }
}
