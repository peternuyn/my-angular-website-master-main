import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ResumeService, Resume } from '../../services/resume.service';
import { Firestore, doc, docData } from '@angular/fire/firestore';

@Component({
  selector: 'app-resume-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resume-view.component.html',
  styleUrls: ['./resume-view.component.scss']
})
export class ResumeViewComponent implements OnInit {
  resume: Resume | null = null;
  isLoading = true;
  error = '';
  profileImageUrl: string | null = null;
userData: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private resumeService: ResumeService,
    private firestore: Firestore
  ) {}

  ngOnInit(): void {
    const resumeId = this.route.snapshot.paramMap.get('id');
    if (resumeId) {
      this.loadResume(resumeId);
    } else {
      this.error = 'Resume ID not provided';
      this.isLoading = false;
    }
  }

  loadResume(resumeId: string): void {
    this.resumeService.getResume(resumeId).subscribe({
      next: (resume) => {
        this.resume = resume;
        
        // Load user profile image
        const userDocRef = doc(this.firestore, `users/${resume.userId}`);
        docData(userDocRef).subscribe(
          (userData: any) => {
            if (userData?.profileImageUrl) {
              this.profileImageUrl = userData.profileImageUrl;
            }
            this.isLoading = false;
          },
          (error: any) => {
            console.error('Error fetching user data:', error);
            this.isLoading = false;
          }
        );

        // Increment view count
        this.resumeService.viewResume(resumeId).subscribe();
      },
      error: (err) => {
        console.error('Error loading resume:', err);
        this.error = 'Resume not found or no longer available';
        this.isLoading = false;
      }
    });
  }

  downloadResume(): void {
    if (this.resume) {
      this.resumeService.downloadResume(this.resume.id).subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = this.resume?.originalName || `${this.resume?.name}_resume.txt`;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          console.error('Error downloading resume:', err);
          alert('Error downloading resume. Please try again.');
        }
      });
    }
  }

  getSkillsArray(skills: string): string[] {
    return skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  goBack(): void {
    this.router.navigate(['/resume-share']);
  }
}