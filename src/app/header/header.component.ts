import { Component, EventEmitter, Output, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth.service';
import { User } from '../account/register/register.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUserDisplay: string = '';
  theme: string = 'light';
  private userSubscription!: Subscription;
  authService = inject(AuthService);


  ngOnInit() {
    console.log('Header component initialized');
    
    // Subscribe to user updates and trigger effect on user change
    this.userSubscription = this.authService.user$.subscribe((currentUser: User | null) => {
      if (currentUser && currentUser.email) {
        this.currentUserDisplay = currentUser.email || '';
      }
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

}
