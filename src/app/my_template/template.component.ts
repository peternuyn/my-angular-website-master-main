import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateHeaderComponent } from './template_header/template_header.component';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { UserProfileService } from './user_profile_service/user_profile_service';
import { Firestore, collection, doc, docData } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-template',
  standalone: true,
  imports: [CommonModule, TemplateHeaderComponent,FormsModule],
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
    if (!userId) {
      console.error('No user ID provided in the route.');
      this.isLoading = false;
      return;
    }
  
    this.isLoading = true;
    const userDocRef = doc(this.firestore, `users/${userId}`);
    this.firestoreSubscription = docData(userDocRef).subscribe(
      (userData: any) => {
        console.log('Retrieved user data:', userData); 
        if (userData) {
          // Retrieve the user data from Firestore
          this.user = userData;
          this.name = userData.name || '';
          this.title = userData.title || '';
          this.aboutMe = userData.aboutMe || '';
          this.contactInfo = userData.contactInfo || '';
          this.otherInfo = userData.otherInfo || '';
          this.profileImageUrl = userData.profileImageUrl || null;
        }
        this.isLoading = false;
      },
      (error: any) => {
        console.error('Error fetching user data:', error);
        this.isLoading = false;
      }
    );
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

  // Method to handle image selection
  onImageSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImageUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
  const currentUser = this.authService.getCurrentUser();
  if (currentUser) {
    const profileData = {
      uid: currentUser.uid,
      name: this.name,
      title: this.title,
      aboutMe: this.aboutMe,
      contactInfo: this.contactInfo,
      otherInfo: this.otherInfo,
      profileImageUrl: this.profileImageUrl,
    };
    
    this.userProfileService.saveUserProfile(currentUser.uid, profileData)
      .then(() => console.log('Profile saved successfully!'))
      .catch((error) => console.error('Error saving profile:', error));
    }
  }
}
