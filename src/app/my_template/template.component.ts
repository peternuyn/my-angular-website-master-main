import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateHeaderComponent } from './template_header/template_header.component';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { User } from '../account/register/register.component';

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
  profileImageUrl: string | ArrayBuffer | null = null;
  theme: string = 'light';
  private userSubscription!: Subscription;
  authService = inject(AuthService);




  ngOnInit() {
    // Subscribe to user updates
    this.userSubscription = this.authService.user$.subscribe((currentUser: User | null) => {
      this.currentUsername = currentUser?.email || '';
    });
  }

  ngOnDestroy() {
    // Clean up the subscription to prevent memory leaks
    this.userSubscription.unsubscribe();
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
}
