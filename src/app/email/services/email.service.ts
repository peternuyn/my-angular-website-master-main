import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = 'http://localhost:3000/sendquestion';

  constructor(private http: HttpClient) {}

  sendEmail(email: string, subject: string, question: string): Observable<any> {
    console.log('Sending email to', email, 'with subject', subject, 'and question', question);
    console.log(this.apiUrl, { email, subject, question });
    return this.http.post(this.apiUrl, { email, subject, question });
  }
}
