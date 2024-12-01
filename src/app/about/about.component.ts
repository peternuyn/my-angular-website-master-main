import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';




@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class AboutComponent {
  name: string = 'Peter Nguyen';
  title: string = 'A passionate developer';

  summary: string =
    'Experienced software engineer with a passion for developing innovative programs that expedite the efficiency and effectiveness of organizational success. Well-versed in technology and writing code to create systems that are reliable and user-friendly.';

  experiences: Array<{ company: string; role: string; duration: string }> = [
    {
      company: 'Tech Company A',
      role: 'Senior Developer',
      duration: 'Jan 2020 - Present',
    },
    {
      company: 'Tech Company B',
      role: 'Software Engineer',
      duration: 'Jun 2017 - Dec 2019',
    },
  ];

  skills: string[] = [
    'JavaScript',
    'TypeScript',
    'Angular',
    'Node.js',
    'CSS',
    'HTML',
  ];

  onImageError(event: any) {

    event.target.src = 'assets/fallback-image.png';

  }
}
