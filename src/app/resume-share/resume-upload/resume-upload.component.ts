import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ResumeService, ResumeUploadData } from '../../../services/resume.service';

@Component({
  selector: 'app-resume-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './resume-upload.component.html',
  styleUrls: ['./resume-upload.component.scss']
})
export class ResumeUploadComponent {
  @Output() resumeUploaded = new EventEmitter<void>();
  
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  uploading = false;
  error = '';
  success = '';

  constructor(
    private fb: FormBuilder,
    private resumeService: ResumeService
  ) {
    this.uploadForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      title: ['', [Validators.minLength(3)]],
      description: ['', [Validators.maxLength(500)]],
      skills: [''],
      experience: ['', [Validators.maxLength(1000)]]
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        this.error = 'Please select a PDF file only.';
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        this.error = 'File size must be less than 5MB.';
        return;
      }
      this.selectedFile = file;
      this.error = '';
    }
  }

  onSubmit(): void {
    if (this.uploadForm.invalid || !this.selectedFile) {
      this.error = 'Please fill in all required fields and select a PDF file.';
      return;
    }

    this.uploading = true;
    this.error = '';
    this.success = '';

    const formData: ResumeUploadData = {
      ...this.uploadForm.value,
      resumeFile: this.selectedFile
    };

    this.resumeService.uploadResume(formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.success = 'Resume uploaded successfully!';
          this.uploadForm.reset();
          this.selectedFile = null;
          this.resumeUploaded.emit();
          
          // Reset file input
          const fileInput = document.getElementById('resumeFile') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
        } else {
          this.error = response.message || 'Failed to upload resume.';
        }
        this.uploading = false;
      },
      error: (err) => {
        this.error = 'Error uploading resume. Please try again.';
        this.uploading = false;
        console.error('Upload error:', err);
      }
    });
  }

  getFileName(): string {
    return this.selectedFile ? this.selectedFile.name : 'No file selected';
  }

  getFileSize(): string {
    if (!this.selectedFile) return '';
    const sizeInMB = (this.selectedFile.size / (1024 * 1024)).toFixed(2);
    return `${sizeInMB} MB`;
  }
} 