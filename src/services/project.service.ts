import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Project {
  id: string;
  userId: string;
  name: string;
  technologies: string[];
  short_description: string;
  long_description: string;
  github_url: string;
  live_url: string;
  image_url: string;
  status: 'completed' | 'in-progress';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCreateData {
  name: string;
  technologies: string;
  short_description: string;
  long_description?: string;
  github_url?: string;
  live_url?: string;
  image_url?: string;
  userId: string;
  status?: 'completed' | 'in-progress';
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  // Use Firebase Functions API
  private apiUrl = '/api';

  constructor(private http: HttpClient) { }

  // Get all projects
  getAllProjects(): Observable<any> {
    return this.http.get(`${this.apiUrl}/projects`);
  }

  // Get projects by user ID
  getUserProjects(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/projects/user/${userId}`);
  }

  // Get a specific project
  getProject(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/projects/${id}`);
  }

  // Create a new project
  createProject(data: ProjectCreateData): Observable<any> {
    return this.http.post(`${this.apiUrl}/projects`, data);
  }

  // Update an existing project
  updateProject(id: string, data: Partial<ProjectCreateData>): Observable<any> {
    return this.http.put(`${this.apiUrl}/projects/${id}`, data);
  }

  // Delete a project
  deleteProject(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/projects/${id}`);
  }
} 