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

  // File upload properties
  selectedFile: File | null = null;
  uploadProgress = 0;
  isUploading = false;
  uploadError = '';
  uploadSuccess = '';
  currentUserId: string = '';
  hasUploadedResume = false;
  uploadedResume: any = null;

  constructor(
    private resumeService: ResumeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getCurrentUserId();
    this.checkForUploadedResume();
  }

  getCurrentUserId(): void {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.uid || '';
  }

  checkForUploadedResume(): void {
    if (this.currentUserId) {
      this.resumeService.getUserResume(this.currentUserId).subscribe({
        next: (resume) => {
          this.hasUploadedResume = true;
          this.uploadedResume = resume;
        },
        error: (err) => {
          // No resume uploaded yet
          this.hasUploadedResume = false;
        }
      });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        this.uploadError = 'Please select a valid file type (PDF, DOC, DOCX, or TXT)';
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.uploadError = 'File size must be less than 5MB';
        return;
      }

      this.selectedFile = file;
      this.uploadError = '';
    }
  }

  uploadResume(): void {
    if (!this.selectedFile || !this.currentUserId) {
      this.uploadError = 'Please select a file and ensure you are logged in';
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadError = '';
    this.uploadSuccess = '';

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 90) {
        clearInterval(progressInterval);
      }
    }, 200);

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('userId', this.currentUserId);
    formData.append('name', this.name);
    formData.append('email', 'vietthanh0120@gmail.com'); // You can make this dynamic

    this.resumeService.uploadResumeFile(formData).subscribe({
      next: (response: any) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;
        this.isUploading = false;
        this.uploadSuccess = 'Resume uploaded successfully!';
        this.selectedFile = null;
        this.checkForUploadedResume();
        
        // Reset file input
        const fileInput = document.getElementById('resumeFile') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      },
      error: (err: any) => {
        clearInterval(progressInterval);
        this.isUploading = false;
        this.uploadError = 'Error uploading resume. Please try again.';
        console.error('Upload error:', err);
      }
    });
  }

  downloadUploadedResume(): void {
    if (this.uploadedResume) {
      this.resumeService.downloadResume(this.uploadedResume.id).subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = this.uploadedResume.originalName || `${this.name}_resume`;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        },
        error: (err: any) => {
          console.error('Error downloading resume:', err);
          alert('Error downloading resume. Please try again.');
        }
      });
    }
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
