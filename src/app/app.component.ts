import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { User } from './account/register/register.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  showHeader: boolean = true;
  authService = inject(AuthService);
  private userSubscription: Subscription = new Subscription();

  constructor(private router: Router) {
    // Subscribe to route changes to toggle header visibility
    this.router.events.subscribe(() => {
      // Set `showHeader` to false when on the '/your-template' route
      this.showHeader = this.router.url !== '/your-template';
    });
  }

  ngOnInit() {
    console.log('App component initialized');
    
    // Subscribe to user updates from AuthService
    this.userSubscription = this.authService.user$.subscribe((user: User | null) => {
      if (user) {
        console.log('User updated:', user);

        // Ensure user properties are available before setting them
        this.authService.currentUserSig.set({
          uid: user.uid || '',  // Default empty string if undefined
          email: user.email || '',  // Default empty string if undefined
          admin: user.admin || false, // Default to false if undefined
          displayName: user.displayName || '',  // Default empty string if undefined
        });

        console.log('User is authenticated');
      } else {
        this.authService.currentUserSig.set(undefined);  // Reset if no user
        console.log('No user authenticated');
      }
    });
  }

  // Cleanup subscription when component is destroyed
  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();  // Prevent memory leaks
    }
  }
}
