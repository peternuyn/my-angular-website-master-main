import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserProfileService } from './user_profile_service/user_profile_service';
import { Firestore, collection, doc, docData } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { jsPDF } from 'jspdf';

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
  uid: string =
    (this.authService.getCurrentUser() as { uid: string })?.uid || '';
  theme: string = 'light';
  user: any;
  private firestoreSubscription!: Subscription;
  constructor(private route: ActivatedRoute, private firestore: Firestore) {}
  isLoading: boolean = true;

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
   * Method to download the resume as a PDF
   */
  downloadPDF() {
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
    yPosition += lineHeight * 2; // Space after title

    // Title
    doc.setFont('times', 'italic');
    doc.setFontSize(19);
    const titleText = ` ${this.title}`;
    const titleTextWidth =
      (doc.getStringUnitWidth(titleText) * doc.getFontSize()) /
      doc.internal.scaleFactor;
    doc.text(titleText, (pageWidth - titleTextWidth) / 2, yPosition); // Center-align title
    yPosition += lineHeight; // Space after title

    // Add profile image if it exists
    let imageHeight = 0;
    if (this.profileImageUrl) {
      const imageWidth = 50; // Image width in mm
      imageHeight = 50; // Image height in mm
      const xPosition = margin + 10; // Left-align the image but not on the margin
      const yPositionImage = yPosition; // Y position for image, directly after text
      doc.addImage(
        this.profileImageUrl as string,
        'JPEG',
        xPosition,
        yPositionImage,
        imageWidth,
        imageHeight
      );
      yPosition += imageHeight + 10; // Adjust yPosition after adding image
    }

    // About Me Section (with bold heading)
    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    const aboutMeHeading = '';
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

    // Contact Info Section (with bold heading)
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

    // Save the PDF with the filename 'resume.pdf'
    doc.save('resume.pdf');
  }
}
