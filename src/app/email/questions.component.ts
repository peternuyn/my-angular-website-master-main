import { Component } from '@angular/core';
import { EmailService } from './services/email.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserStateService } from '../global_user_state/globalUser.serivce';


@Component({
  selector: 'app-question',
  standalone: true,
  template: `
    <div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <form (submit)="sendQuestion()" class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Your Name</label>
          <input type="text" id="name" [(ngModel)]="name" name="name" placeholder="Your Name" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Your Email</label>
          <input type="email" id="email" [(ngModel)]="email" name="email" placeholder="Your Email" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label for="question" class="block text-sm font-medium text-gray-700">Your Question</label>
          <textarea id="question" [(ngModel)]="question" name="question" placeholder="Your Question" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
        </div>
        <div>
          <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Send Question</button>
        </div>
      </form>
      <p class="mt-4 text-center text-sm text-gray-600">{{ message }}</p>
    </div>
  `,
  imports: [CommonModule, FormsModule],
})
export class QuestionComponent {
  name: string = '';
  email: string = '';
  question: string = '';
  message: string = '';
  isAnAdmin: boolean = false;
  
  constructor(private emailService: EmailService, private userStateService: UserStateService ) {}

  ngOnInit() {
    this.isAnAdmin = this.userStateService.isAnAdmin();
  }

  sendQuestion() {
    this.emailService.sendEmail(this.email, `Question from ${this.name}`, this.question).subscribe({
      next: (data) => {
        let res: any = data;
        console.log(
          `👏 > 👏 > 👏 > 👏 ${this.name} is successfully registered and mail has been sent and the message id is ${res.messageId}`
        );

        this.resetForm();
      },
      error: (error) => {
        // Check if the error response is HTML (indicating a server error page)
        if (typeof error.error === 'string' && error.error.startsWith('<!DOCTYPE html>')) {
          this.message = 'Error sending question: Server returned an HTML error page';
          console.error('Received HTML error response:', error.error);
        } else {
          // Fallback to JSON error message if available
          this.message = error.message || 'Unknown error';
        }
      }
    });
  }
  

  resetForm() {
    this.name = '';
    this.email = '';
    this.question = '';
  }
}
