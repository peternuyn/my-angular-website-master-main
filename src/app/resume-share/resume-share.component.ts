import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ResumeService, Resume } from '../../services/resume.service';
import { AuthService } from '../../services/auth.service';
import { ResumeListComponent } from './resume-list/resume-list.component';

@Component({
  selector: 'app-resume-share',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ResumeListComponent],
  templateUrl: './resume-share.component.html',
  styleUrls: ['./resume-share.component.scss']
})
export class ResumeShareComponent implements OnInit {
  resumes: Resume[] = [];
  loading = false;
  error = '';
  searchQuery = '';
  activeTab = 'browse'; // 'browse' or 'upload'
  currentUserId: string = '';

  constructor(
    private resumeService: ResumeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadResumes();
    this.getCurrentUserId();
  }

  getCurrentUserId(): void {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.uid || '';
  }

  loadResumes(): void {
    this.loading = true;
    this.error = '';
    
    this.resumeService.getAllResumes().subscribe({
      next: (resumes) => {
        this.resumes = resumes;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading resumes. Please check if the server is running.';
        this.loading = false;
        console.error('Error loading resumes:', err);
      }
    });
  }

  searchResumes(): void {
    if (!this.searchQuery.trim()) {
      this.loadResumes();
      return;
    }

    this.loading = true;
    this.error = '';

    this.resumeService.searchResumes(this.searchQuery).subscribe({
      next: (resumes) => {
        this.resumes = resumes;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error searching resumes';
        this.loading = false;
        console.error('Error searching resumes:', err);
      }
    });
  }

  onResumeUploaded(): void {
    this.loadResumes();
    this.activeTab = 'browse';
  }

  onResumeDeleted(): void {
    this.loadResumes();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.loadResumes();
  }
} 