import { Component, EventEmitter, Output, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { User } from '../../account/register/register.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'template-header',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './template_header.component.html',
})
export class TemplateHeaderComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  currentUsername: string = '';
  theme: string = 'light';
  private userSubscription!: Subscription;


  ngOnInit(): void {
    console.log('Header component initialized');
    // Subscribe to user updates
    this.userSubscription = this.authService.user$.subscribe((currentUser: User | null) => {
      console.log('User updated:', currentUser);
      if (currentUser) {
        this.currentUsername = currentUser.email || '';
      } else {
        this.currentUsername = '';
      }
    });
  }

  ngOnDestroy() {
    // Clean up the subscription to prevent memory leaks
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  @Output() themeChange = new EventEmitter<string>();
  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.themeChange.emit(this.theme);
  }
}