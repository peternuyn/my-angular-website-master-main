const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Mock data for development
const mockResumes = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    title: 'Senior Software Engineer',
    description: 'Experienced software engineer with 5+ years in web development',
    skills: 'JavaScript, TypeScript, Angular, Node.js, Firebase',
    experience: '5+ years in software development',
    filename: 'john_doe_resume.pdf',
    originalName: 'John_Doe_Resume.pdf',
    downloadUrl: 'https://example.com/resumes/john_doe_resume.pdf',
    fileSize: 1024000,
    uploadedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    downloads: 15,
    views: 45,
    isUpdated: false
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    title: 'Frontend Developer',
    description: 'Passionate frontend developer specializing in modern web technologies',
    skills: 'React, Vue.js, CSS, HTML, JavaScript',
    experience: '3+ years in frontend development',
    filename: 'jane_smith_resume.pdf',
    originalName: 'Jane_Smith_Resume.pdf',
    downloadUrl: 'https://example.com/resumes/jane_smith_resume.pdf',
    fileSize: 890000,
    uploadedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    downloads: 8,
    views: 23,
    isUpdated: false
  }
];

// Resume Management APIs
app.get('/resumes', async (req, res) => {
  try {
    console.log('Fetching resumes...');
    
    // Return mock data for now
    console.log(`Returning ${mockResumes.length} mock resumes`);
    res.json({
      success: true,
      resumes: mockResumes
    });
  } catch (error) {
    console.error('Error getting public resumes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/resumes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Resume ID is required'
      });
    }

    const resume = mockResumes.find(r => r.id === id);
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    res.json({
      success: true,
      resume
    });
  } catch (error) {
    console.error('Error getting resume:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/resumes/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // For now, return the first mock resume
    const resume = mockResumes[0];
    
    res.json({
      success: true,
      resume
    });
  } catch (error) {
    console.error('Error getting user resume:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/resumes', async (req, res) => {
  try {
    const { name, email, title, description, skills, experience, userId } = req.body;
    
    if (!name || !email || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and userId are required'
      });
    }

    // Create a new mock resume
    const newResume = {
      id: Date.now().toString(),
      name,
      email,
      title: title || '',
      description: description || '',
      skills: skills || '',
      experience: experience || '',
      userId,
      filename: `${name.toLowerCase().replace(/\s+/g, '_')}_resume.pdf`,
      originalName: `${name}_Resume.pdf`,
      downloadUrl: `https://example.com/resumes/${name.toLowerCase().replace(/\s+/g, '_')}_resume.pdf`,
      fileSize: 1024000,
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      downloads: 0,
      views: 0,
      isUpdated: false
    };

    mockResumes.push(newResume);

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully',
      resumeId: newResume.id
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/resumes/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Resume ID is required'
      });
    }

    const resume = mockResumes.find(r => r.id === id);
    if (resume) {
      resume.views += 1;
    }

    res.json({
      success: true,
      message: 'View count incremented'
    });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.delete('/resumes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Resume ID is required'
      });
    }

    const index = mockResumes.findIndex(r => r.id === id);
    if (index > -1) {
      mockResumes.splice(index, 1);
    }

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/resumes/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const filteredResumes = mockResumes.filter(resume => {
      const searchText = `${resume.name} ${resume.title} ${resume.description} ${resume.skills}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });

    res.json({
      success: true,
      resumes: filteredResumes
    });
  } catch (error) {
    console.error('Error searching resumes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET  /health');
  console.log('  GET  /resumes');
  console.log('  GET  /resumes/:id');
  console.log('  GET  /resumes/user/:userId');
  console.log('  POST /resumes');
  console.log('  POST /resumes/:id/view');
  console.log('  DELETE /resumes/:id');
  console.log('  GET  /resumes/search/:query');
  console.log('Using mock data for development');
}); 