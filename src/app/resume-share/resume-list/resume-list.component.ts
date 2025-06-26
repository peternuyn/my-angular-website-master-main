import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeService, Resume } from '../../../services/resume.service';

@Component({
  selector: 'app-resume-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resume-list.component.html',
  styleUrls: ['./resume-list.component.scss']
})
export class ResumeListComponent {
  @Input() resumes: Resume[] = [];
  @Output() resumeDeleted = new EventEmitter<void>();

  constructor(private resumeService: ResumeService) {}

  downloadResume(resume: Resume): void {
    // Use the download URL from Firebase Storage
    if (resume.downloadUrl) {
      const link = document.createElement('a');
      link.href = resume.downloadUrl;
      link.download = resume.originalName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Fallback to API call if download URL is not available
      this.resumeService.downloadResume(resume.id).subscribe({
        next: (response) => {
          if (response.success && response.data.downloadUrl) {
            const link = document.createElement('a');
            link.href = response.data.downloadUrl;
            link.download = resume.originalName;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        },
        error: (err) => {
          console.error('Error downloading resume:', err);
          alert('Error downloading resume. Please try again.');
        }
      });
    }
  }

  viewResume(resume: Resume): void {
    this.resumeService.viewResume(resume.id).subscribe({
      next: (response) => {
        if (response.success) {
          resume.views = response.views;
        }
      },
      error: (err) => {
        console.error('Error updating view count:', err);
      }
    });
  }

  deleteResume(resume: Resume): void {
    if (confirm(`Are you sure you want to delete ${resume.name}'s resume?`)) {
      this.resumeService.deleteResume(resume.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.resumeDeleted.emit();
          } else {
            alert('Failed to delete resume. Please try again.');
          }
        },
        error: (err) => {
          console.error('Error deleting resume:', err);
          alert('Error deleting resume. Please try again.');
        }
      });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getSkillsDisplay(skills: string): string {
    if (!skills) return 'No skills listed';
    const skillsArray = skills.split(',').map(s => s.trim());
    return skillsArray.slice(0, 3).join(', ') + (skillsArray.length > 3 ? '...' : '');
  }

  truncateText(text: string, maxLength: number = 100): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
} 