/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const multer = require('multer');
const path = require('path');

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Initialize Firebase Admin
admin.initializeApp();

// Get Firestore database
const db = admin.firestore();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'), false);
    }
  }
});

// Middleware to handle CORS
const corsHandler = (req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.set('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  next();
};

// Health check endpoint
exports.health = functions.https.onRequest((req, res) => {
  corsHandler(req, res, () => {
    res.json({
      success: true,
      message: 'Firebase Functions are running',
      timestamp: new Date().toISOString()
    });
  });
});

// Helper function to convert Firestore Timestamps to ISO strings
function convertTimestamps(data) {
  if (!data || typeof data !== 'object') return data;
  
  const converted = {};
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && value.seconds && value.nanoseconds) {
      // This is a Firestore Timestamp
      converted[key] = new Date(value.seconds * 1000 + value.nanoseconds / 1000000).toISOString();
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively convert nested objects
      converted[key] = convertTimestamps(value);
    } else {
      converted[key] = value;
    }
  }
  return converted;
}

// Resume Management Functions

// Get all resumes (GET) or Upload resume (POST)
exports.getAllResumes = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method === 'GET') {
      // Get all resumes
      try {
        console.log('Fetching all resumes...');
        
        const resumesSnapshot = await db.collection('resumes').get();
        const resumes = [];
        
        resumesSnapshot.forEach(doc => {
          const resumeData = convertTimestamps(doc.data());
          resumes.push({
            id: doc.id,
            ...resumeData
          });
        });

        console.log(`Returning ${resumes.length} resumes`);
        res.json({
          success: true,
          resumes: resumes
        });
      } catch (error) {
        console.error('Error getting resumes:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    } else if (req.method === 'POST') {
      // Upload/Create resume
      try {
        const { name, email, title, description, skills, experience, userId } = req.body;
        
        if (!name || !email || !userId) {
          return res.status(400).json({
            success: false,
            error: 'Name, email, and userId are required'
          });
        }

        // Check if user already has a resume
        const existingResumeSnapshot = await db.collection('resumes')
          .where('userId', '==', userId)
          .limit(1)
          .get();

        const isUpdate = !existingResumeSnapshot.empty;
        let resumeId;

        const resumeData = {
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
          downloads: 0,
          views: 0,
          isUpdated: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        if (isUpdate) {
          // Update existing resume
          const existingDoc = existingResumeSnapshot.docs[0];
          resumeId = existingDoc.id;
          resumeData.uploadedAt = existingDoc.data().uploadedAt;
          resumeData.downloads = existingDoc.data().downloads;
          resumeData.views = existingDoc.data().views;
          
          await db.collection('resumes').doc(resumeId).update(resumeData);
        } else {
          // Create new resume
          resumeData.uploadedAt = admin.firestore.FieldValue.serverTimestamp();
          const docRef = await db.collection('resumes').add(resumeData);
          resumeId = docRef.id;
        }

        const responseData = {
          id: resumeId,
          ...resumeData
        };

        res.status(isUpdate ? 200 : 201).json({
          success: true,
          message: isUpdate ? 'Resume updated successfully' : 'Resume uploaded successfully',
          isUpdate,
          data: responseData
        });
      } catch (error) {
        console.error('Error uploading resume:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    } else {
      res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }
  });
});

// Get resume by ID (GET) or Delete resume (DELETE)
exports.getResume = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method === 'GET') {
      // Get resume by ID
      try {
        const resumeId = req.path.split('/').pop();
        
        if (!resumeId) {
          return res.status(400).json({
            success: false,
            error: 'Resume ID is required'
          });
        }

        const resumeDoc = await db.collection('resumes').doc(resumeId).get();
        
        if (!resumeDoc.exists) {
          return res.status(404).json({
            success: false,
            error: 'Resume not found'
          });
        }

        const resume = {
          id: resumeDoc.id,
          ...convertTimestamps(resumeDoc.data())
        };

        res.json({
          success: true,
          resume: resume
        });
      } catch (error) {
        console.error('Error getting resume:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    } else if (req.method === 'DELETE') {
      // Delete resume
      try {
        const resumeId = req.path.split('/').pop();
        
        if (!resumeId) {
          return res.status(400).json({
            success: false,
            error: 'Resume ID is required'
          });
        }

        await db.collection('resumes').doc(resumeId).delete();

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
    } else {
      res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }
  });
});

// Get resume by user ID
exports.getUserResume = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      const userId = req.path.split('/').pop();
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      const resumesSnapshot = await db.collection('resumes')
        .where('userId', '==', userId)
        .limit(1)
        .get();

      if (resumesSnapshot.empty) {
        return res.status(404).json({
          success: false,
          error: 'Resume not found for this user'
        });
      }

      const resumeDoc = resumesSnapshot.docs[0];
      const resume = {
        id: resumeDoc.id,
        ...convertTimestamps(resumeDoc.data())
      };

      res.json({
        success: true,
        resume: resume
      });
    } catch (error) {
      console.error('Error getting user resume:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
});

// Increment view count
exports.viewResume = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      // Extract resume ID from the URL path
      // URL format: /api/resumes/{resumeId}/view
      const pathParts = req.path.split('/');
      const resumeId = pathParts[pathParts.length - 2]; // Get the ID before 'view'
      
      if (!resumeId) {
        return res.status(400).json({
          success: false,
          error: 'Resume ID is required'
        });
      }

      const resumeRef = db.collection('resumes').doc(resumeId);
      
      // Use transaction to safely increment view count
      const result = await db.runTransaction(async (transaction) => {
        const resumeDoc = await transaction.get(resumeRef);
        
        if (!resumeDoc.exists) {
          throw new Error('Resume not found');
        }

        const currentViews = resumeDoc.data().views || 0;
        const newViews = currentViews + 1;
        transaction.update(resumeRef, { views: newViews });
        
        return newViews;
      });

      console.log(`Incremented view count for resume ${resumeId} to ${result}`);

      res.json({
        success: true,
        message: 'View count incremented',
        views: result
      });
    } catch (error) {
      console.error('Error incrementing view count:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
});

// Search resumes
exports.searchResumes = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      const query = req.path.split('/').pop();
      
      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }

      const resumesSnapshot = await db.collection('resumes').get();
      const resumes = [];
      
      resumesSnapshot.forEach(doc => {
        const resume = doc.data();
        const searchText = `${resume.name} ${resume.title} ${resume.description} ${resume.skills}`.toLowerCase();
        
        if (searchText.includes(query.toLowerCase())) {
          const resumeData = convertTimestamps(resume);
          resumes.push({
            id: doc.id,
            ...resumeData
          });
        }
      });

      res.json({
        success: true,
        resumes: resumes
      });
    } catch (error) {
      console.error('Error searching resumes:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
});

// Download resume
exports.downloadResume = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      // Extract resume ID from the URL path
      // URL format: /api/resumes/{resumeId}/download
      const pathParts = req.path.split('/');
      const resumeId = pathParts[pathParts.length - 2]; // Get the ID before 'download'
      
      if (!resumeId) {
        return res.status(400).json({
          success: false,
          error: 'Resume ID is required'
        });
      }

      console.log(`Attempting to download resume with ID: ${resumeId}`);

      const resumeDoc = await db.collection('resumes').doc(resumeId).get();
      
      if (!resumeDoc.exists) {
        console.log(`Resume not found with ID: ${resumeId}`);
        return res.status(404).json({
          success: false,
          error: 'Resume not found'
        });
      }

      const resume = resumeDoc.data();

      // Increment download count
      await db.collection('resumes').doc(resumeId).update({
        downloads: (resume.downloads || 0) + 1
      });

      console.log(`Downloaded resume ${resumeId}. New download count: ${(resume.downloads || 0) + 1}`);

      // Check if this is an uploaded file
      if (resume.fileBuffer && resume.fileType) {
        // Return the uploaded file
        const fileBuffer = Buffer.from(resume.fileBuffer, 'base64');
        
        // Set appropriate content type
        let contentType = resume.fileType;
        if (resume.fileType === 'application/msword') {
          contentType = 'application/msword';
        } else if (resume.fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        }

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${resume.originalName}"`);
        res.setHeader('Content-Length', fileBuffer.length);
        
        res.send(fileBuffer);
      } else {
        // Generate text content for resumes without uploaded files
        const resumeContent = `
RESUME

Name: ${resume.name}
Email: ${resume.email}
Title: ${resume.title}

About:
${resume.description}

Skills:
${resume.skills}

Experience:
${resume.experience}

Uploaded: ${resume.uploadedAt ? resume.uploadedAt.toDate().toISOString() : 'Unknown'}
        `.trim();

        // Set headers for file download
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="${resume.originalName}"`);
        res.setHeader('Content-Length', Buffer.byteLength(resumeContent, 'utf8'));
        
        res.send(resumeContent);
      }
    } catch (error) {
      console.error('Error downloading resume:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
});

// Project Management Functions

// Get all projects (GET) or Create project (POST)
exports.getAllProjects = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method === 'GET') {
      // Get all projects
      try {
        console.log('Fetching all projects...');
        
        const projectsSnapshot = await db.collection('projects').get();
        const projects = [];
        
        projectsSnapshot.forEach(doc => {
          projects.push({
            id: doc.id,
            ...doc.data()
          });
        });

        res.json({
          success: true,
          data: projects
        });
      } catch (error) {
        console.error('Error getting projects:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    } else if (req.method === 'POST') {
      // Create project
      try {
        const { name, technologies, short_description, long_description, github_url, live_url, image_url, userId, status } = req.body;
        
        if (!name || !technologies || !short_description || !userId) {
          return res.status(400).json({
            success: false,
            error: 'Name, technologies, short_description, and userId are required'
          });
        }

        const projectData = {
          userId,
          name,
          technologies: Array.isArray(technologies) ? technologies : technologies.split(',').map(t => t.trim()),
          short_description,
          long_description: long_description || '',
          github_url: github_url || '',
          live_url: live_url || '',
          image_url: image_url || '',
          status: status || 'in-progress',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('projects').add(projectData);
        const newProject = {
          id: docRef.id,
          ...projectData
        };

        res.status(201).json({
          success: true,
          message: 'Project created successfully',
          data: newProject
        });
      } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    } else {
      res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }
  });
});

// Get projects by user ID
exports.getUserProjects = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      const userId = req.path.split('/').pop();
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      const projectsSnapshot = await db.collection('projects')
        .where('userId', '==', userId)
        .get();

      const projects = [];
      projectsSnapshot.forEach(doc => {
        projects.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`Found ${projects.length} projects for user ${userId}`);
      
      res.json({
        success: true,
        data: projects
      });
    } catch (error) {
      console.error('Error getting user projects:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
});

// Get project by ID (GET), Update project (PUT), or Delete project (DELETE)
exports.getProject = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method === 'GET') {
      // Get project by ID
      try {
        const projectId = req.path.split('/').pop();
        
        if (!projectId) {
          return res.status(400).json({
            success: false,
            error: 'Project ID is required'
          });
        }

        const projectDoc = await db.collection('projects').doc(projectId).get();
        
        if (!projectDoc.exists) {
          return res.status(404).json({
            success: false,
            error: 'Project not found'
          });
        }

        const project = {
          id: projectDoc.id,
          ...projectDoc.data()
        };

        res.json({
          success: true,
          data: project
        });
      } catch (error) {
        console.error('Error getting project:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    } else if (req.method === 'PUT') {
      // Update project
      try {
        const projectId = req.path.split('/').pop();
        const updateData = req.body;
        
        if (!projectId) {
          return res.status(400).json({
            success: false,
            error: 'Project ID is required'
          });
        }

        // Ensure technologies is always an array
        if (updateData.technologies) {
          updateData.technologies = Array.isArray(updateData.technologies) 
            ? updateData.technologies 
            : updateData.technologies.split(',').map(t => t.trim());
        }

        updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

        await db.collection('projects').doc(projectId).update(updateData);

        const updatedDoc = await db.collection('projects').doc(projectId).get();
        const updatedProject = {
          id: updatedDoc.id,
          ...updatedDoc.data()
        };

        res.json({
          success: true,
          message: 'Project updated successfully',
          data: updatedProject
        });
      } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    } else if (req.method === 'DELETE') {
      // Delete project
      try {
        const projectId = req.path.split('/').pop();
        
        if (!projectId) {
          return res.status(400).json({
            success: false,
            error: 'Project ID is required'
          });
        }

        await db.collection('projects').doc(projectId).delete();

        res.json({
          success: true,
          message: 'Project deleted successfully'
        });
      } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    } else {
      res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }
  });
});

// Upload Resume Function
exports.uploadResume = functions.https.onRequest((req, res) => {
  console.log('uploadResume function called');
  console.log('Request method:', req.method);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  console.log('Request path:', req.path);
  
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      console.log('Method not allowed:', req.method);
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }

    try {
      let { name, email, title, description, skills, experience, userId } = req.body;
      console.log('Extracted data:', { name, email, title, description, skills, experience, userId });
      
      if (!name || !email) {
        console.log('Missing required fields');
        return res.status(400).json({
          success: false,
          error: 'Name and email are required'
        });
      }

      // If userId is not provided, generate a random one
      if (!userId) {
        userId = 'guest_' + Math.random().toString(36).substring(2, 12);
        console.log('Generated guest userId:', userId);
      }

      // Check if user already has a resume
      const existingResumeSnapshot = await db.collection('resumes')
        .where('userId', '==', userId)
        .limit(1)
        .get();

      const isUpdate = !existingResumeSnapshot.empty;
      let resumeId;
      console.log('Is update:', isUpdate);

      const resumeData = {
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
        downloads: 0,
        views: 0,
        isUpdated: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      if (isUpdate) {
        // Update existing resume
        const existingDoc = existingResumeSnapshot.docs[0];
        resumeId = existingDoc.id;
        resumeData.uploadedAt = existingDoc.data().uploadedAt;
        resumeData.downloads = existingDoc.data().downloads;
        resumeData.views = existingDoc.data().views;
        
        await db.collection('resumes').doc(resumeId).update(resumeData);
        console.log('Updated existing resume with ID:', resumeId);
      } else {
        // Create new resume
        resumeData.uploadedAt = admin.firestore.FieldValue.serverTimestamp();
        const docRef = await db.collection('resumes').add(resumeData);
        resumeId = docRef.id;
        console.log('Created new resume with ID:', resumeId);
      }

      const responseData = {
        id: resumeId,
        ...resumeData
      };

      console.log('Sending success response');
      res.status(isUpdate ? 200 : 201).json({
        success: true,
        message: isUpdate ? 'Resume updated successfully' : 'Resume uploaded successfully',
        isUpdate,
        data: responseData
      });
    } catch (error) {
      console.error('Error uploading resume:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
});

// Create Project Function
exports.createProject = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }

    try {
      const { userId, name, technologies, short_description, long_description, github_url, live_url, image_url, status } = req.body;
      
      if (!userId || !name || !technologies || !short_description) {
        return res.status(400).json({
          success: false,
          error: 'userId, name, technologies, and short_description are required'
        });
      }

      const projectData = {
        userId,
        name,
        technologies: Array.isArray(technologies) ? technologies : technologies.split(',').map(t => t.trim()),
        short_description,
        long_description: long_description || '',
        github_url: github_url || '',
        live_url: live_url || '',
        image_url: image_url || '',
        status: status || 'in-progress',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await db.collection('projects').add(projectData);
      const newProject = {
        id: docRef.id,
        ...projectData
      };

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: newProject
      });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
});

// Update Project Function
exports.updateProject = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'PUT') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }

    try {
      const projectId = req.path.split('/').pop();
      const updateData = req.body;
      
      if (!projectId) {
        return res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
      }

      // Ensure technologies is always an array
      if (updateData.technologies) {
        updateData.technologies = Array.isArray(updateData.technologies) 
          ? updateData.technologies 
          : updateData.technologies.split(',').map(t => t.trim());
      }

      updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

      await db.collection('projects').doc(projectId).update(updateData);

      const updatedDoc = await db.collection('projects').doc(projectId).get();
      const updatedProject = {
        id: updatedDoc.id,
        ...updatedDoc.data()
      };

      res.json({
        success: true,
        message: 'Project updated successfully',
        data: updatedProject
      });
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
});

// Delete Project Function
exports.deleteProject = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'DELETE') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }

    try {
      const projectId = req.path.split('/').pop();
      
      if (!projectId) {
        return res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
      }

      await db.collection('projects').doc(projectId).delete();

      res.json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
});

// Delete Resume Function
exports.deleteResume = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'DELETE') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }

    try {
      const resumeId = req.path.split('/').pop();
      
      if (!resumeId) {
        return res.status(400).json({
          success: false,
          error: 'Resume ID is required'
        });
      }

      await db.collection('resumes').doc(resumeId).delete();

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
});

// Upload resume file
exports.uploadResumeFile = functions.https.onRequest((req, res) => {
  console.log('uploadResumeFile called with method:', req.method);
  console.log('Request headers:', req.headers);
  console.log('Request body keys:', Object.keys(req.body || {}));
  
  // Handle CORS preflight
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.set('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  // Use multer to handle file upload
  upload.single('file')(req, res, async (err) => {
    console.log('Multer processing completed');
    console.log('Multer error:', err);
    console.log('Request file:', req.file);
    console.log('Request body after multer:', req.body);
    
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }

    try {
      const file = req.file;
      const { userId, name, email } = req.body;

      console.log('Extracted data:', { userId, name, email, fileExists: !!file });

      if (!file) {
        console.log('No file uploaded');
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      if (!userId || !name) {
        console.log('Missing required fields:', { userId, name });
        return res.status(400).json({
          success: false,
          error: 'userId and name are required'
        });
      }

      // Check if user already has a resume
      const existingResumeSnapshot = await db.collection('resumes')
        .where('userId', '==', userId)
        .limit(1)
        .get();

      const isUpdate = !existingResumeSnapshot.empty;
      let resumeId;

      // Create file metadata
      const fileExtension = path.extname(file.originalname);
      const fileName = `${name.toLowerCase().replace(/\s+/g, '_')}_resume${fileExtension}`;

      const resumeData = {
        name,
        email: email || 'vietthanh0120@gmail.com',
        title: '',
        description: '',
        skills: '',
        experience: '',
        userId,
        filename: fileName,
        originalName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        fileBuffer: file.buffer.toString('base64'), // Store file content as base64
        downloads: 0,
        views: 0,
        isUpdated: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      if (isUpdate) {
        // Update existing resume
        const existingDoc = existingResumeSnapshot.docs[0];
        resumeId = existingDoc.id;
        resumeData.uploadedAt = existingDoc.data().uploadedAt;
        resumeData.downloads = existingDoc.data().downloads;
        resumeData.views = existingDoc.data().views;
        
        await db.collection('resumes').doc(resumeId).update(resumeData);
      } else {
        // Create new resume
        resumeData.uploadedAt = admin.firestore.FieldValue.serverTimestamp();
        const docRef = await db.collection('resumes').add(resumeData);
        resumeId = docRef.id;
      }

      const responseData = {
        id: resumeId,
        ...resumeData,
        fileBuffer: undefined // Don't send file content in response
      };

      console.log(`Resume file uploaded successfully: ${fileName}`);

      res.status(isUpdate ? 200 : 201).json({
        success: true,
        message: isUpdate ? 'Resume file updated successfully' : 'Resume file uploaded successfully',
        isUpdate,
        data: responseData
      });
    } catch (error) {
      console.error('Error uploading resume file:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
});
