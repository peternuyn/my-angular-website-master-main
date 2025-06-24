# My Resume Website with Resume Sharing Platform

A modern Angular website with a resume sharing platform that allows users to upload, browse, and download resumes. Users can also create personalized resume templates and share them directly to the platform. **Now with project management capabilities!**

## Features

### Frontend (Angular)
- Modern, responsive UI with DaisyUI and Tailwind CSS
- Resume sharing platform with upload and browse functionality
- **Personalized resume template creation** with PDF generation
- **One-click sharing** from template to resume platform
- **Project management system** - Add, edit, and organize your portfolio projects
- **Integrated projects in resumes** - Projects automatically included in PDF generation
- User authentication with Firebase
- Dark/light theme toggle
- Professional portfolio sections

### Backend (Express.js API)
- RESTful API for resume management
- **RESTful API for project management**
- File upload handling (PDF only, max 5MB)
- Search functionality
- Download tracking
- View counting

## Setup Instructions

### 1. Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

The backend server will run on `http://localhost:3001`

### 2. Frontend Setup

1. Install dependencies (from the root directory):
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

The frontend will run on `http://localhost:4200`

## API Endpoints

### Health Check
- `GET /api/health` - Check if server is running

### Resumes
- `GET /api/resumes` - Get all resumes
- `GET /api/resumes/:id` - Get a specific resume
- `POST /api/resumes` - Upload a new resume
- `DELETE /api/resumes/:id` - Delete a resume
- `GET /api/resumes/:id/download` - Download a resume file
- `POST /api/resumes/:id/view` - Increment view count
- `GET /api/resumes/search/:query` - Search resumes

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/user/:userId` - Get projects by user ID
- `GET /api/projects/:id` - Get a specific project
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:id` - Update an existing project
- `DELETE /api/projects/:id` - Delete a project

## File Upload Requirements

- Only PDF files are accepted
- Maximum file size: 5MB
- Files are stored in the `server/uploads/` directory

## Usage

### Project Management
1. Navigate to "Projects" in the header
2. Click "Manage Projects" button (requires authentication)
3. Add your projects with:
   - Project name and description
   - Technologies used (comma-separated)
   - GitHub and live demo URLs
   - Project status (completed/in-progress)
   - Project images
4. Edit or delete projects as needed
5. Projects are automatically included in your resume PDF

### Resume Template Creation
1. Navigate to "Your Template" in the header (requires authentication)
2. Fill in your personal information:
   - Name and professional title
   - Upload a profile image
   - About Me section
   - Contact information
   - Additional information
3. **Add your projects** using the "Manage Projects" link
4. Save your template
5. Click "Share to Resume Platform" to automatically:
   - Generate a PDF from your template (including projects)
   - Upload it to the resume sharing platform
   - Extract skills from your content and projects
   - Make it searchable by other users

### Resume Sharing Platform
1. Start both the backend and frontend servers
2. Navigate to `http://localhost:4200`
3. Click on "Share Resumes" in the navigation
4. **Browse tab**: Search and view all shared resumes
5. **Upload tab**: Manually upload a PDF resume
6. Download resumes you're interested in
7. Track views and downloads for each resume

## Project Structure

```
my-angular-website/
├── server/                 # Backend API server
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   └── uploads/           # Resume file storage
├── src/
│   ├── app/
│   │   ├── resume-share/  # Resume sharing components
│   │   │   ├── resume-share.component.ts
│   │   │   ├── resume-upload/
│   │   │   └── resume-list/
│   │   ├── my_template/   # Resume template creation
│   │   │   ├── template.component.ts
│   │   │   └── user_profile_service/
│   │   ├── project-management/  # Project management
│   │   │   ├── project-management.component.ts
│   │   │   ├── project-management.component.html
│   │   │   └── project-management.component.scss
│   │   └── ...            # Other components
│   └── services/
│       ├── resume.service.ts  # API communication service
│       ├── project.service.ts # Project API service
│       └── auth.service.ts    # Authentication service
└── package.json           # Frontend dependencies
```

## Technologies Used

### Frontend
- Angular 18
- DaisyUI
- Tailwind CSS
- Firebase (Authentication & Firestore)
- RxJS
- jsPDF (PDF generation)

### Backend
- Node.js
- Express.js
- Multer (file uploads)
- CORS
- UUID

## Development

### Backend Development
- The server uses in-memory storage for development
- For production, consider using a database like MongoDB or PostgreSQL
- File storage can be moved to cloud storage (AWS S3, Google Cloud Storage)

### Frontend Development
- Uses Angular standalone components
- Responsive design with mobile-first approach
- Form validation and error handling
- Real-time search functionality
- Automatic PDF generation from templates
- Skill extraction from resume content and projects

## Project Management Features

### Comprehensive Project Organization
- Add unlimited projects with detailed information
- Categorize projects as "completed" or "in-progress"
- Include GitHub links, live demos, and project images
- Technology stack tracking with badges
- Rich text descriptions for project details

### Seamless Resume Integration
- Projects automatically included in PDF generation
- Skills extracted from project technologies
- Professional formatting in resume sections
- Separate sections for completed and in-progress projects

### User-Friendly Interface
- Intuitive project management dashboard
- Real-time form validation
- Responsive design for all devices
- Easy editing and deletion of projects
- Visual project status indicators

## Template Sharing Features

### Automatic PDF Generation
- Converts template content to professional PDF format
- Includes profile image, contact info, and all sections
- **Automatically includes user projects with proper formatting**
- Maintains formatting and styling

### Smart Skill Extraction
- Automatically detects common skills from resume content
- **Extracts skills from project technologies**
- Supports 50+ programming languages and technologies
- Includes soft skills and methodologies

### Seamless Integration
- One-click sharing from template to platform
- Automatic metadata extraction (name, email, title)
- Real-time status updates and error handling
- **Projects enhance resume content and skill detection**

## Security Considerations

- File type validation (PDF only)
- File size limits
- CORS configuration
- Input validation and sanitization
- Consider adding authentication for uploads in production

## Deployment

### Backend Deployment
- Deploy to platforms like Heroku, Railway, or DigitalOcean
- Set up environment variables for production
- Configure proper CORS settings for your domain

### Frontend Deployment
- Build the project: `npm run build`
- Deploy to platforms like Vercel, Netlify, or Firebase Hosting
- Update the API URL in `resume.service.ts` for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

My-Resume allows you to create your own resume template and share it with others. Please sign up and sign in to use the `my_template` function. Alternatively, you can use the following account to sign in:
- **Email:** vietthanh0120@gmail.com
- **Password:** abc123

**Technologies used:** Nx workspace, Angular 18, TypeScript, Tailwind CSS + Daisy UI, Firebase, JEST, Github action.

To download the code and run it locally, follow these steps:
1. Download the file.
2. Navigate to the `MY-ANGULAR-WEBSITE` directory and run `npm install`.
3. Run `npm run dev`.


This is my personal project that I made in order to gain understanding of Firebase deployment and CI/CD set ups.