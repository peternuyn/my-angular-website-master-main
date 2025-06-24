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
  skills: string[];
  experience: string;
  fileName: string;
  filePath: string;
  originalFileName: string;
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
  private apiUrl = 'http://localhost:3001/api';

  constructor(private http: HttpClient) { }

  // Get all resumes
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

  // Update existing resume
  updateResume(id: string, data: ResumeUploadData): Observable<any> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('userId', data.userId);
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.skills) formData.append('skills', data.skills);
    if (data.experience) formData.append('experience', data.experience);
    formData.append('resumeFile', data.resumeFile);

    return this.http.put(`${this.apiUrl}/resumes/${id}`, formData);
  }

  // Download a resume
  downloadResume(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/resumes/${id}/download`, {
      responseType: 'blob'
    });
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