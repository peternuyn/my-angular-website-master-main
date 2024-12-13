import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { UserProfileService } from './user_profile_service/user_profile_service';
import { Firestore, collection, doc, docData } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import html2pdf from 'html2pdf.js';

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
  uid: string = this.authService.getCurrentUser()?.uid || '';
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
    const currentUser = this.authService.getCurrentUser();  // Get the current user
    this.isEditable = currentUser?.uid === userId; // Boolean comparison
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
   *  Method to handle the image selection
   * @param event 
   * @returns  void
   */
  onImageSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (!fileInput.files?.length) return; // Early exit if no files

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = () => (this.profileImageUrl = reader.result);
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
    const element = document.getElementById('resume'); // This is your HTML content to convert to PDF
    const options = {
      margin: 1,
      filename: 'my_resume.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'in', format: 'letter', compressPDF: true }
    };

    // Call the default import as a function
    html2pdf().from(element).set(options).save();
  }
  
}
