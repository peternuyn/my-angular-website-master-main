import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Resume {
  id: string;
  userId: string;
  name: string;
  email: string;
  title: string;
  description: string;
  skills: string;
  experience: string;
  filename: string;
  originalName: string;
  downloadUrl: string;
  fileSize: number;
  uploadedAt: string;
  updatedAt: string;
  downloads: number;
  views: number;
  isUpdated: boolean;
}

export interface ResumeUploadData {
  name: string;
  email: string;
  title?: string;
  description?: string;
  skills?: string;
  experience?: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResumeService {
  // Use Firebase Functions API
  private apiUrl = '/api';

  constructor(private http: HttpClient) { }

  // Get all resumes (public resumes)
  getAllResumes(): Observable<Resume[]> {
    return this.http.get<any>(`${this.apiUrl}/resumes`).pipe(
      map(response => response.resumes || [])
    );
  }

  // Get a specific resume
  getResume(id: string): Observable<Resume> {
    return this.http.get<any>(`${this.apiUrl}/resumes/${id}`).pipe(
      map(response => response.resume)
    );
  }

  // Get resume by user ID (to check if user already has a resume)
  getUserResume(userId: string): Observable<Resume> {
    return this.http.get<any>(`${this.apiUrl}/resumes/user/${userId}`).pipe(
      map(response => response.resume)
    );
  }

  // Upload a new resume or update existing one
  uploadResume(data: ResumeUploadData): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    
    return this.http.post(`${this.apiUrl}/resumes/upload`, data, { headers });
  }

  // Download a resume (now returns the download URL)
  downloadResume(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/resumes/${id}/download`, { responseType: 'blob' });
  }

  // Increment view count
  viewResume(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resumes/${id}/view`, {});
  }

  // Delete a resume
  deleteResume(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/resumes/${id}`);
  }

  // Search resumes
  searchResumes(query: string): Observable<Resume[]> {
    return this.http.get<any>(`${this.apiUrl}/resumes/search/${query}`).pipe(
      map(response => response.resumes || [])
    );
  }

  // Health check
  healthCheck(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }
} 