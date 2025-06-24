import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserProfileService } from './user_profile_service/user_profile_service';
import { Firestore, collection, doc, docData } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { jsPDF } from 'jspdf';
import { ResumeService, ResumeUploadData, Resume } from '../../services/resume.service';
import { ProjectService, Project } from '../../services/project.service';

@Component({
  selector: 'app-template',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './template.component.html',
})
export class TemplateComponent {
  name: string = '';
  title: string = '';
  aboutMe: string = '';
  contactInfo: string = '';
  otherInfo: string = '';
  currentUsername: string = '';
  private userSubscription!: Subscription;
  profileImageUrl: string | ArrayBuffer | null = null;
  isEditable: boolean = false;
  authService = inject(AuthService);
  userProfileService = inject(UserProfileService);
  resumeService = inject(ResumeService);
  projectService = inject(ProjectService);
  uid: string =
    (this.authService.getCurrentUser() as { uid: string })?.uid || '';
  theme: string = 'light';
  user: any;
  private firestoreSubscription!: Subscription;
  constructor(private route: ActivatedRoute, private firestore: Firestore) {}
  isLoading: boolean = true;
  isSharing: boolean = false;
  shareMessage: string = '';
  existingResume: Resume | null = null;
  hasExistingResume: boolean = false;
  userProjects: Project[] = [];

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    console.log('User ID from route:', userId);
    if (!userId) return; // Exit early if no userId

    this.isLoading = true;
    const userDocRef = doc(this.firestore, `users/${userId}`);
    // Fetch user data from Firestore
    this.firestoreSubscription = docData(userDocRef).subscribe(
      (userData: any) => {
        if (!userData) return; // Early exit if userData is not found
        this.user = userData;
        const {
          name = '',
          title = '',
          aboutMe = '',
          contactInfo = '',
          otherInfo = '',
          profileImageUrl = null,
        } = userData;
        this.name = name;
        this.title = title;
        this.aboutMe = aboutMe;
        this.contactInfo = contactInfo;
        this.otherInfo = otherInfo;
        this.profileImageUrl = profileImageUrl;
        this.isLoading = false;
      },
      (error: any) => {
        console.error('Error fetching user data:', error);
        this.isLoading = false;
      }
    );

    // Check if the current user is the owner of the profile
    const currentUser = this.authService.getCurrentUser(); // Get the current user
    console.log('Current user UID:', currentUser?.uid);
    console.log('User ID from route:', userId);

    if (currentUser?.uid === userId) {
      this.isEditable = true; // Boolean comparison
      console.log('isEditable:', this.isEditable);
      // Check if user already has a resume
      this.checkExistingResume(currentUser.uid);
      // Load user projects
      this.loadUserProjects(currentUser.uid);
    } else {
      console.log('User is not the owner.');
    }
    this.isLoading = false;
    console.log(this.authService.getCurrentUser());
  }

  ngOnDestroy(): void {
    if (this.userSubscription) this.userSubscription.unsubscribe();
    if (this.firestoreSubscription) this.firestoreSubscription.unsubscribe();
  }

  @Output() themeChange = new EventEmitter<string>();
  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.themeChange.emit(this.theme);
  }

  /**
   * Load user projects
   */
  loadUserProjects(userId: string): void {
    this.projectService.getUserProjects(userId).subscribe({
      next: (response) => {
        if (response.success) {
          this.userProjects = response.data;
          console.log('User projects loaded:', this.userProjects);
        }
      },
      error: (error) => {
        console.error('Error loading user projects:', error);
      }
    });
  }

  /**
   * Check if user already has a resume
   */
  checkExistingResume(userId: string): void {
    this.resumeService.getUserResume(userId).subscribe({
      next: (response) => {
        if (response.success) {
          this.existingResume = response.data;
          this.hasExistingResume = true;
          console.log('User already has a resume:', this.existingResume);
        }
      },
      error: (error) => {
        // 404 means no resume exists, which is fine
        if (error.status !== 404) {
          console.error('Error checking existing resume:', error);
        }
        this.hasExistingResume = false;
      }
    });
  }

  /**
   * Method to handle the image selection
   * @param event
   * @returns void
   */
  onImageSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (!(fileInput instanceof HTMLInputElement) || !fileInput.files?.length)
      return; // Early exit if no files

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = () => (this.profileImageUrl = reader.result as string);
    reader.onerror = () => console.error('File reading failed');
    reader.readAsDataURL(file);
  }

  /**
   *  Method to save the profile data
   * @returns void
   */
  saveProfile() {
    if (!this.isEditable) {
      console.warn('You do not have permission to edit this profile.');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const profileData = {
      name: this.name,
      title: this.title,
      aboutMe: this.aboutMe,
      contactInfo: this.contactInfo,
      otherInfo: this.otherInfo,
      profileImageUrl: this.profileImageUrl,
    };

    if (JSON.stringify(this.user) === JSON.stringify(profileData)) {
      console.log('No changes detected. Profile not saved.');
      return; // Early exit if no changes
    }

    this.userProfileService
      .saveUserProfile(currentUser.uid, profileData)
      .then(() => console.log('Profile saved successfully!'))
      .catch((error) => console.error('Error saving profile:', error));
  }

  /**
   * Method to generate PDF blob from template
   */
  generatePDFBlob(): Promise<Blob> {
    return new Promise((resolve) => {
      // Create a new jsPDF instance with A4 paper size (210mm x 297mm)
      const doc = new jsPDF('p', 'mm', 'a4');

      // Set margins and spacing
      const margin = 20; // 20mm margin
      const pageWidth = doc.internal.pageSize.width; // Page width for center alignment
      const lineHeight = 8; // Adjust line height for spacing
      let yPosition = margin; // Starting Y position
      // Set font (use a more professional font like Times New Roman)
      doc.setFont('times', 'normal');

      // Name
      doc.setFontSize(24);
      doc.setFont('courier', 'bold');
      const title = `${this.name}`;
      const titleWidth =
        (doc.getStringUnitWidth(title) * doc.getFontSize()) /
        doc.internal.scaleFactor;
      doc.text(title, (pageWidth - titleWidth) / 2, yPosition); // Center-align the title
      yPosition += lineHeight * 2;

      // Title/Position
      doc.setFontSize(16);
      doc.setFont('times', 'italic');
      const positionTitle = `${this.title}`;
      const positionTitleWidth =
        (doc.getStringUnitWidth(positionTitle) * doc.getFontSize()) /
        doc.internal.scaleFactor;
      doc.text(positionTitle, (pageWidth - positionTitleWidth) / 2, yPosition); // Center-align the position
      yPosition += lineHeight * 2;

      // About Me Section (with bold heading)
      doc.setFontSize(14);
      doc.setFont('times', 'bold');
      const aboutMeHeading = 'About Me:';
      const aboutMeHeadingWidth =
        (doc.getStringUnitWidth(aboutMeHeading) * doc.getFontSize()) /
        doc.internal.scaleFactor;
      doc.text(aboutMeHeading, (pageWidth - aboutMeHeadingWidth) / 2, yPosition); // Center-align heading
      yPosition += lineHeight;
      doc.setFontSize(12);
      doc.setFont('times', 'normal');
      const aboutMeLines = doc.splitTextToSize(
        this.aboutMe,
        pageWidth - 2 * margin
      ); // Justify text within page width
      doc.text(aboutMeLines, margin, yPosition);
      yPosition += aboutMeLines.length * lineHeight;

      // Projects Section (if user has projects)
      if (this.userProjects.length > 0) {
        yPosition += lineHeight; // Add some space before projects section
        
        doc.setFontSize(14);
        doc.setFont('times', 'bold');
        const projectsHeading = 'Projects:';
        const projectsHeadingWidth =
          (doc.getStringUnitWidth(projectsHeading) * doc.getFontSize()) /
          doc.internal.scaleFactor;
        doc.text(projectsHeading, (pageWidth - projectsHeadingWidth) / 2, yPosition);
        yPosition += lineHeight;

        doc.setFontSize(12);
        doc.setFont('times', 'normal');

        // Add completed projects
        const completedProjects = this.userProjects.filter(p => p.status === 'completed');
        if (completedProjects.length > 0) {
          doc.setFont('times', 'bold');
          doc.text('Completed Projects:', margin, yPosition);
          yPosition += lineHeight;
          doc.setFont('times', 'normal');

          completedProjects.forEach((project, index) => {
            if (yPosition > 250) { // Check if we need a new page
              doc.addPage();
              yPosition = margin;
            }

            // Project name
            doc.setFont('times', 'bold');
            doc.text(`${project.name}`, margin, yPosition);
            yPosition += lineHeight;

            // Project description
            doc.setFont('times', 'normal');
            const projectDescLines = doc.splitTextToSize(
              project.short_description,
              pageWidth - 2 * margin
            );
            doc.text(projectDescLines, margin, yPosition);
            yPosition += projectDescLines.length * lineHeight;

            // Technologies
            doc.setFont('times', 'italic');
            const techText = `Technologies: ${project.technologies.join(', ')}`;
            doc.text(techText, margin, yPosition);
            yPosition += lineHeight * 1.5;

            doc.setFont('times', 'normal');
          });
        }

        // Add in-progress projects
        const inProgressProjects = this.userProjects.filter(p => p.status === 'in-progress');
        if (inProgressProjects.length > 0) {
          if (yPosition > 250) { // Check if we need a new page
            doc.addPage();
            yPosition = margin;
          }

          doc.setFont('times', 'bold');
          doc.text('Works in Progress:', margin, yPosition);
          yPosition += lineHeight;
          doc.setFont('times', 'normal');

          inProgressProjects.forEach((project, index) => {
            if (yPosition > 250) { // Check if we need a new page
              doc.addPage();
              yPosition = margin;
            }

            // Project name
            doc.setFont('times', 'bold');
            doc.text(`${project.name}`, margin, yPosition);
            yPosition += lineHeight;

            // Project description
            doc.setFont('times', 'normal');
            const projectDescLines = doc.splitTextToSize(
              project.short_description,
              pageWidth - 2 * margin
            );
            doc.text(projectDescLines, margin, yPosition);
            yPosition += projectDescLines.length * lineHeight;

            // Technologies
            doc.setFont('times', 'italic');
            const techText = `Technologies: ${project.technologies.join(', ')}`;
            doc.text(techText, margin, yPosition);
            yPosition += lineHeight * 1.5;

            doc.setFont('times', 'normal');
          });
        }
      }

      // Contact Info Section (with bold heading)
      if (yPosition > 250) { // Check if we need a new page
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(14);
      doc.setFont('times', 'bold');
      const contactHeading = 'Contact Information:';
      const contactHeadingWidth =
        (doc.getStringUnitWidth(contactHeading) * doc.getFontSize()) /
        doc.internal.scaleFactor;
      doc.text(contactHeading, (pageWidth - contactHeadingWidth) / 2, yPosition); // Center-align heading
      yPosition += lineHeight;
      doc.setFontSize(12);
      doc.setFont('times', 'normal');
      const contactLines = doc.splitTextToSize(
        this.contactInfo,
        pageWidth - 2 * margin
      ); // Justify text within page width
      doc.text(contactLines, margin, yPosition);
      yPosition += contactLines.length * lineHeight;

      // Other Info Section (with bold heading)
      doc.setFontSize(14);
      doc.setFont('times', 'bold');
      const otherInfoHeading = 'Additional Information:';
      const otherInfoHeadingWidth =
        (doc.getStringUnitWidth(otherInfoHeading) * doc.getFontSize()) /
        doc.internal.scaleFactor;
      doc.text(
        otherInfoHeading,
        (pageWidth - otherInfoHeadingWidth) / 2,
        yPosition
      ); // Center-align heading
      yPosition += lineHeight;
      doc.setFontSize(12);
      doc.setFont('times', 'normal');
      const otherInfoLines = doc.splitTextToSize(
        this.otherInfo,
        pageWidth - 2 * margin
      ); // Justify text within page width
      doc.text(otherInfoLines, margin, yPosition);
      yPosition += otherInfoLines.length * lineHeight * 2; // Extra space before the image

      // Footer with contact info or additional text
      doc.setFontSize(10);
      doc.setFont('times', 'italic');
      const footerText =
        'Generated with My Resume App - Contact: your-email@example.com';
      const footerWidth =
        (doc.getStringUnitWidth(footerText) * doc.getFontSize()) /
        doc.internal.scaleFactor;
      doc.text(footerText, (pageWidth - footerWidth) / 2, 285); // Center-align the footer text

      // Convert to blob
      const pdfBlob = doc.output('blob');
      resolve(pdfBlob);
    });
  }

  /**
   * Method to download the resume as a PDF
   */
  downloadPDF() {
    this.generatePDFBlob().then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${this.name.replace(/\s+/g, '_')}_resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    });
  }

  /**
   * Method to share template to resume platform
   */
  async shareToResumePlatform() {
    if (!this.name || !this.aboutMe) {
      this.shareMessage = 'Please fill in your name and about me section before sharing.';
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.shareMessage = 'Please sign in to share your resume.';
      return;
    }

    this.isSharing = true;
    this.shareMessage = '';

    try {
      // Generate PDF blob
      const pdfBlob = await this.generatePDFBlob();
      
      // Create a File object from the blob
      const pdfFile = new File([pdfBlob], `${this.name.replace(/\s+/g, '_')}_resume.pdf`, {
        type: 'application/pdf'
      });

      // Extract email from contact info if available
      const emailMatch = this.contactInfo.match(/[\w.-]+@[\w.-]+\.\w+/);
      const email = emailMatch ? emailMatch[0] : '';

      // Prepare upload data
      const uploadData: ResumeUploadData = {
        name: this.name,
        email: email || 'no-email@example.com',
        title: this.title,
        description: this.aboutMe,
        skills: this.extractSkillsFromText(),
        experience: this.otherInfo,
        userId: currentUser.uid,
        resumeFile: pdfFile
      };

      // Upload to resume platform (will create new or update existing)
      this.resumeService.uploadResume(uploadData).subscribe({
        next: (response) => {
          if (response.success) {
            const isUpdate = response.isUpdate;
            this.shareMessage = isUpdate 
              ? 'Resume updated successfully!' 
              : 'Successfully shared to resume platform!';
            
            // Update local state
            if (isUpdate) {
              this.existingResume = response.data;
              this.hasExistingResume = true;
            } else {
              this.existingResume = response.data;
              this.hasExistingResume = true;
            }
            
            // Clear message after 3 seconds
            setTimeout(() => {
              this.shareMessage = '';
            }, 3000);
          } else {
            this.shareMessage = response.message || 'Failed to share resume.';
          }
          this.isSharing = false;
        },
        error: (err) => {
          console.error('Error sharing resume:', err);
          this.shareMessage = 'Error sharing resume. Please try again.';
          this.isSharing = false;
        }
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      this.shareMessage = 'Error generating PDF. Please try again.';
      this.isSharing = false;
    }
  }

  /**
   * Extract skills from text content and projects
   */
  private extractSkillsFromText(): string {
    const allText = `${this.aboutMe} ${this.otherInfo}`.toLowerCase();
    const projectSkills = this.userProjects
      .flatMap(project => project.technologies)
      .map(tech => tech.toLowerCase());
    
    const allSkills = [...new Set([...allText.split(' '), ...projectSkills])];
    
    const commonSkills = [
      'javascript', 'typescript', 'angular', 'react', 'vue', 'node.js', 'python',
      'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
      'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind', 'material-ui',
      'mongodb', 'postgresql', 'mysql', 'redis', 'firebase', 'aws', 'azure',
      'docker', 'kubernetes', 'git', 'github', 'gitlab', 'jenkins', 'ci/cd',
      'agile', 'scrum', 'kanban', 'jira', 'figma', 'sketch', 'adobe',
      'machine learning', 'ai', 'data science', 'analytics', 'sql', 'nosql'
    ];

    const foundSkills = commonSkills.filter(skill => 
      allSkills.some(text => text.includes(skill.toLowerCase()))
    );

    return foundSkills.join(', ');
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get completed projects count
   */
  getCompletedProjectsCount(): number {
    return this.userProjects.filter(p => p.status === 'completed').length;
  }

  /**
   * Get in-progress projects count
   */
  getInProgressProjectsCount(): number {
    return this.userProjects.filter(p => p.status === 'in-progress').length;
  }
}
