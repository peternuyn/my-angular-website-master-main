import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { User } from './account/register/register.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CommonModule],
  templateUrl: './app.component.html',


})
export class AppComponent {
  showHeader: boolean = true;
  authService = inject(AuthService);

  constructor(private router: Router) {
    // Subscribe to route changes
    this.router.events.subscribe(() => {
      // Update `showHeader` based on the current URL
      this.showHeader = this.router.url !== '/your-template';
    });
  }

  ngOnInit() {
    console.log('App component initialized');
    this.authService.user$.subscribe((user: User) => {
      console.log('User updated:', user);
      if (user) {
        this.authService.currentUserSig.set({
          email: user.email!,
          password: user.password!,
          admin: user.admin
        });
        console.log('User is authenticated');
        console.log('User:', user.email);
      } else {
        this.authService.currentUserSig.set(undefined);
    }
  });
  }
  
}
