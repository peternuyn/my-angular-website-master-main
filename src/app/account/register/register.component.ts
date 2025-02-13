import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Component, inject } from "@angular/core";
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../../services/auth.service";
import { NgIf } from "@angular/common";




export interface User {

  uid: string;

  email?: string;
  
  admin?: boolean;

  displayName?: string;  // Add displayName property

}

@Component({
    selector: 'app-register',
    templateUrl: 'register.component.html',
    standalone: true,
    imports: [ReactiveFormsModule, FormsModule, NgIf],
    providers: [AuthService]
})

export class RegisterComponent {
    isSigningUp: boolean = false;
    errorMessage: string | undefined;
    loginErrorMessage: string | undefined;
    admin: boolean = false;

    fb = inject(FormBuilder);
    http = inject(HttpClient);
    router = inject(Router);
    authService = inject(AuthService);

    
    form = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
        username: ['', Validators.required],
        password: ['', Validators.required],
        isAdmin: [this.admin]
    });

    

    signUp(): void {
        const rawForm = this.form.getRawValue();
        this.authService.register(rawForm.email, rawForm.username, rawForm.password).subscribe({
                    complete: () => this.router.navigateByUrl('/signup'),
                    error: (error: HttpErrorResponse) => {
                        if (error.status === 400) {
                          this.errorMessage = 'Bad Request: Please check your input.';
                        } else {
                          this.errorMessage = 'Double check your password and email.';
                        }
                      }
                    });     

        console.log(
            `👏 > 👏 > 👏 > 👏 ${rawForm.username} is successfully registered and mail has been sent`
        );
      
    }

    toggleSignUp() {
        if (this.isSigningUp) {
          this.isSigningUp = false;
          return;
        }
        this.isSigningUp = true;
    }
    
      toggleAdmin() {
        if (this.admin) {
          this.admin = false;
          return;
        }
        this.admin = true;
    }

    login(): void {
      const rawForm = this.form.getRawValue();

      this.authService.login(rawForm.username, rawForm.password).subscribe({
        complete: () => {
          this.router.navigateByUrl('/')
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.loginErrorMessage = 'Bad Request: Please check your input.';
          } else {
            this.loginErrorMessage = 'An unexpected error occurred.';
          }
        }
      });

    }
    
}