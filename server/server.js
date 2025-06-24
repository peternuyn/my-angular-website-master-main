const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Allow only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// In-memory storage for resumes (in production, use a database)
let resumes = [];
let projects = [];

// Routes

// GET all resumes
app.get('/api/resumes', (req, res) => {
  try {
    res.json({
      success: true,
      data: resumes,
      count: resumes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching resumes',
      error: error.message
    });
  }
});

// GET all projects
app.get('/api/projects', (req, res) => {
  try {
    res.json({
      success: true,
      data: projects,
      count: projects.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
});

// GET projects by user ID
app.get('/api/projects/user/:userId', (req, res) => {
  try {
    const userProjects = projects.filter(p => p.userId === req.params.userId);
    res.json({
      success: true,
      data: userProjects,
      count: userProjects.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user projects',
      error: error.message
    });
  }
});

// GET single project by ID
app.get('/api/projects/:id', (req, res) => {
  try {
    const project = projects.find(p => p.id === req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching project',
      error: error.message
    });
  }
});

// POST new project
app.post('/api/projects', (req, res) => {
  try {
    const { name, technologies, short_description, long_description, github_url, live_url, image_url, userId, status = 'completed' } = req.body;
    
    if (!name || !technologies || !short_description || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Name, technologies, short description, and userId are required'
      });
    }

    const newProject = {
      id: uuidv4(),
      userId,
      name,
      technologies: technologies.split(',').map(tech => tech.trim()),
      short_description,
      long_description: long_description || '',
      github_url: github_url || '',
      live_url: live_url || '',
      image_url: image_url || '',
      status, // 'completed' or 'in-progress'
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    projects.push(newProject);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: newProject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating project',
      error: error.message
    });
  }
});

// PUT update project
app.put('/api/projects/:id', (req, res) => {
  try {
    const { name, technologies, short_description, long_description, github_url, live_url, image_url, status } = req.body;
    const projectIndex = projects.findIndex(p => p.id === req.params.id);
    
    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const existingProject = projects[projectIndex];
    
    const updatedProject = {
      ...existingProject,
      name: name || existingProject.name,
      technologies: technologies ? technologies.split(',').map(tech => tech.trim()) : existingProject.technologies,
      short_description: short_description || existingProject.short_description,
      long_description: long_description || existingProject.long_description,
      github_url: github_url || existingProject.github_url,
      live_url: live_url || existingProject.live_url,
      image_url: image_url || existingProject.image_url,
      status: status || existingProject.status,
      updatedAt: new Date().toISOString()
    };

    projects[projectIndex] = updatedProject;

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating project',
      error: error.message
    });
  }
});

// DELETE project
app.delete('/api/projects/:id', (req, res) => {
  try {
    const projectIndex = projects.findIndex(p => p.id === req.params.id);
    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    projects.splice(projectIndex, 1);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting project',
      error: error.message
    });
  }
});

// GET single resume by ID
app.get('/api/resumes/:id', (req, res) => {
  try {
    const resume = resumes.find(r => r.id === req.params.id);
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }
    res.json({
      success: true,
      data: resume
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching resume',
      error: error.message
    });
  }
});

// GET single resume by user ID (for checking if user already has a resume)
app.get('/api/resumes/user/:userId', (req, res) => {
  try {
    const resume = resumes.find(r => r.userId === req.params.userId);
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'No resume found for this user'
      });
    }
    res.json({
      success: true,
      data: resume
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user resume',
      error: error.message
    });
  }
});

// POST new resume or UPDATE existing one
app.post('/api/resumes', upload.single('resumeFile'), (req, res) => {
  try {
    const { name, email, title, description, skills, experience, userId } = req.body;
    
    if (!name || !email || !req.file || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, resume file, and userId are required'
      });
    }

    // Check if user already has a resume
    const existingResumeIndex = resumes.findIndex(r => r.userId === userId);
    
    if (existingResumeIndex !== -1) {
      // Update existing resume
      const existingResume = resumes[existingResumeIndex];
      
      // Delete old file if it exists
      if (existingResume.fileName && fs.existsSync(path.join(uploadsDir, existingResume.fileName))) {
        fs.unlinkSync(path.join(uploadsDir, existingResume.fileName));
      }

      // Update resume data
      const updatedResume = {
        ...existingResume,
        name,
        email,
        title: title || '',
        description: description || '',
        skills: skills ? skills.split(',').map(skill => skill.trim()) : [],
        experience: experience || '',
        fileName: req.file.filename,
        filePath: req.file.path,
        originalFileName: req.file.originalname,
        updatedAt: new Date().toISOString(),
        isUpdated: true
      };

      resumes[existingResumeIndex] = updatedResume;

      res.json({
        success: true,
        message: 'Resume updated successfully',
        data: updatedResume,
        isUpdate: true
      });
    } else {
      // Create new resume
      const newResume = {
        id: uuidv4(),
        userId,
        name,
        email,
        title: title || '',
        description: description || '',
        skills: skills ? skills.split(',').map(skill => skill.trim()) : [],
        experience: experience || '',
        fileName: req.file.filename,
        filePath: req.file.path,
        originalFileName: req.file.originalname,
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        downloads: 0,
        views: 0,
        isUpdated: false
      };

      resumes.push(newResume);

      res.status(201).json({
        success: true,
        message: 'Resume uploaded successfully',
        data: newResume,
        isUpdate: false
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading resume',
      error: error.message
    });
  }
});

// PUT update resume (alternative endpoint for updates)
app.put('/api/resumes/:id', upload.single('resumeFile'), (req, res) => {
  try {
    const { name, email, title, description, skills, experience } = req.body;
    const resumeIndex = resumes.findIndex(r => r.id === req.params.id);
    
    if (resumeIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    const existingResume = resumes[resumeIndex];
    
    // Delete old file if new file is uploaded
    if (req.file && existingResume.fileName && fs.existsSync(path.join(uploadsDir, existingResume.fileName))) {
      fs.unlinkSync(path.join(uploadsDir, existingResume.fileName));
    }

    // Update resume data
    const updatedResume = {
      ...existingResume,
      name: name || existingResume.name,
      email: email || existingResume.email,
      title: title || existingResume.title,
      description: description || existingResume.description,
      skills: skills ? skills.split(',').map(skill => skill.trim()) : existingResume.skills,
      experience: experience || existingResume.experience,
      fileName: req.file ? req.file.filename : existingResume.fileName,
      filePath: req.file ? req.file.path : existingResume.filePath,
      originalFileName: req.file ? req.file.originalname : existingResume.originalFileName,
      updatedAt: new Date().toISOString(),
      isUpdated: true
    };

    resumes[resumeIndex] = updatedResume;

    res.json({
      success: true,
      message: 'Resume updated successfully',
      data: updatedResume
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating resume',
      error: error.message
    });
  }
});

// Download resume file
app.get('/api/resumes/:id/download', (req, res) => {
  try {
    const resume = resumes.find(r => r.id === req.params.id);
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Increment download count
    resume.downloads += 1;

    const filePath = path.join(__dirname, 'uploads', resume.fileName);
    res.download(filePath, resume.originalFileName);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error downloading resume',
      error: error.message
    });
  }
});

// View resume (increment view count)
app.post('/api/resumes/:id/view', (req, res) => {
  try {
    const resume = resumes.find(r => r.id === req.params.id);
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    resume.views += 1;

    res.json({
      success: true,
      message: 'View count updated',
      views: resume.views
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating view count',
      error: error.message
    });
  }
});

// DELETE resume
app.delete('/api/resumes/:id', (req, res) => {
  try {
    const resumeIndex = resumes.findIndex(r => r.id === req.params.id);
    if (resumeIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    const resume = resumes[resumeIndex];
    
    // Delete file from filesystem
    const filePath = path.join(__dirname, 'uploads', resume.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from array
    resumes.splice(resumeIndex, 1);

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting resume',
      error: error.message
    });
  }
});

// Search resumes
app.get('/api/resumes/search/:query', (req, res) => {
  try {
    const query = req.params.query.toLowerCase();
    const filteredResumes = resumes.filter(resume => 
      resume.name.toLowerCase().includes(query) ||
      resume.title.toLowerCase().includes(query) ||
      resume.skills.some(skill => skill.toLowerCase().includes(query)) ||
      resume.description.toLowerCase().includes(query)
    );

    res.json({
      success: true,
      data: filteredResumes,
      count: filteredResumes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching resumes',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: error.message
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Resume API server is running',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Resume API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
}); 