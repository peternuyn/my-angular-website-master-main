import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResumeService } from '../../services/resume.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AboutComponent implements OnInit {
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

  constructor(
    private resumeService: ResumeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getCurrentUserId();
  }

  getCurrentUserId(): void {
    const currentUser = this.authService.getCurrentUser();
    // We don't need to store currentUserId anymore since we removed upload functionality
  }

  formatDate(dateInput: any): string {
    if (!dateInput) return '';
    // Firestore Timestamp object
    if (typeof dateInput === 'object' && dateInput.seconds) {
      return new Date(dateInput.seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    // ISO string or JS Date
    const date = new Date(dateInput);
    return isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onImageError(event: any) {
    event.target.src = 'assets/fallback-image.png';
  }
}
