import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  title: string = 'Welcome to My Resume';
  skills: string[] = ['JavaScript', 'TypeScript', 'Angular', 'React'];
  experience: string[] = [
    'Software Developer at XYZ Corp',
    'Frontend Developer at ABC Inc',
  ];
  projects: string[] = [
    'Project A - A web application for...',
    'Project B - A mobile app for...',
  ];
  description: string =
    'This is the home page of my resume. Here you will find information about my skills, experience, and projects.';
}
