# Resume API Server

A simple Express.js API server for sharing and managing resumes with support for user-specific resume updates.

## Features

- Upload resume files (PDF only)
- **One resume per user** - prevents duplicate uploads
- **Update existing resumes** - users can update their resume instead of creating new ones
- View all shared resumes
- Download resumes
- Search resumes by name, title, skills, or description
- Track views and downloads
- Delete resumes
- User-specific resume management

## Setup

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

The server will run on `http://localhost:3001`

## API Endpoints

### Health Check
- `GET /api/health` - Check if server is running

### Resumes
- `GET /api/resumes` - Get all resumes
- `GET /api/resumes/:id` - Get a specific resume
- `GET /api/resumes/user/:userId` - Get resume by user ID
- `POST /api/resumes` - Upload a new resume or update existing one
- `PUT /api/resumes/:id` - Update a specific resume
- `DELETE /api/resumes/:id` - Delete a resume
- `GET /api/resumes/:id/download` - Download a resume file
- `POST /api/resumes/:id/view` - Increment view count
- `GET /api/resumes/search/:query` - Search resumes

## File Upload

- Only PDF files are accepted
- Maximum file size: 5MB
- Files are stored in the `uploads/` directory
- Old files are automatically deleted when updating

## Data Structure

Each resume object contains:
```json
{
  "id": "uuid",
  "userId": "user-unique-id",
  "name": "string",
  "email": "string",
  "title": "string",
  "description": "string",
  "skills": ["array", "of", "skills"],
  "experience": "string",
  "fileName": "string",
  "filePath": "string",
  "originalFileName": "string",
  "uploadedAt": "ISO date string",
  "updatedAt": "ISO date string",
  "downloads": "number",
  "views": "number",
  "isUpdated": "boolean"
}
```

## User-Specific Resume Management

### One Resume Per User
- Each user can only have one resume on the platform
- When a user uploads a resume, the system checks if they already have one
- If a resume exists, it updates the existing one instead of creating a new one
- This prevents spam and keeps the platform clean

### Update vs Create
- **First upload**: Creates a new resume with `isUpdated: false`
- **Subsequent uploads**: Updates existing resume with `isUpdated: true`
- **File management**: Old PDF files are automatically deleted when updating

### User Identification
- Resumes are linked to users via `userId` field
- The `userId` should be the same as the user's authentication ID
- This ensures only the owner can update their resume

## Response Format

### Successful Upload (New Resume)
```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "data": { /* resume object */ },
  "isUpdate": false
}
```

### Successful Update (Existing Resume)
```json
{
  "success": true,
  "message": "Resume updated successfully",
  "data": { /* updated resume object */ },
  "isUpdate": true
}
```

## Error Handling

- **Duplicate prevention**: Users cannot create multiple resumes
- **File validation**: Only PDF files accepted
- **Size limits**: Maximum 5MB per file
- **Required fields**: Name, email, file, and userId are required
- **User verification**: Only resume owners can update their resumes

## Security Considerations

- File type validation (PDF only)
- File size limits (5MB)
- User-specific access control
- Automatic cleanup of old files
- Input validation and sanitization 