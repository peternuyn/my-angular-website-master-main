import { Component, EventEmitter, Output, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { User } from '../account/register/register.component';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  theme: string = 'light';
  private userSubscription!: Subscription;
  private routerSubscription!: Subscription;
  authService = inject(AuthService);
  firestore = inject(Firestore);
  router = inject(Router);

  currentUserId: string = '';
  currentUserDisplay: string = '';
  users: User[] = [];
  errorMessage: string = '';
  isTemplatePage: boolean = false;
  @Output() themeChange = new EventEmitter<string>();

  ngOnInit(): void {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.theme = savedTheme;
      this.themeChange.emit(this.theme);
    }

    // Subscribe to router events to detect template pages
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkIfTemplatePage(event.url);
    });

    // Check current route on init
    this.checkIfTemplatePage(this.router.url);

    // Fetch Firestore users
    const usersCollection = collection(this.firestore, 'users');
    this.userSubscription = collectionData(usersCollection, { idField: 'id' }).subscribe(
      (users: any[]) => {
        this.users = users;

        // Set current user details
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          this.currentUserDisplay = currentUser.displayName || currentUser.email || '';
          this.currentUserId = currentUser.uid;
        }
      },
      (error: any) => {
        console.error('Error fetching users:', error);
        this.errorMessage = 'Failed to load user data. Please try again later.';
      }
    );
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  /**
   * Check if current page is a template page
   */
  checkIfTemplatePage(url: string): void {
    this.isTemplatePage = url.startsWith('/user/');
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.theme);
    this.themeChange.emit(this.theme);
  }

  signOut() {
    this.authService.logout();
    window.location.reload(); 
  }
}
