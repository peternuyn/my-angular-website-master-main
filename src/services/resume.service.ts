import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  resumeFile: File;
}

@Injectable({
  providedIn: 'root'
})
export class ResumeService {
  // Use Firebase Functions API
  private apiUrl = '/api';

  constructor(private http: HttpClient) { }

  // Get all resumes (public resumes)
  getAllResumes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/resumes`);
  }

  // Get a specific resume
  getResume(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/resumes/${id}`);
  }

  // Get resume by user ID (to check if user already has a resume)
  getUserResume(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/resumes/user/${userId}`);
  }

  // Upload a new resume or update existing one
  uploadResume(data: ResumeUploadData): Observable<any> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('userId', data.userId);
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.skills) formData.append('skills', data.skills);
    if (data.experience) formData.append('experience', data.experience);
    formData.append('resumeFile', data.resumeFile);

    return this.http.post(`${this.apiUrl}/resumes`, formData);
  }

  // Download a resume (now returns the download URL)
  downloadResume(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/resumes/${id}`);
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
  searchResumes(query: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/resumes/search/${query}`);
  }

  // Health check
  healthCheck(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }
} 