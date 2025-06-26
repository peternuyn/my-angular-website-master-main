/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

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

const db = admin.firestore();
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads (using memory storage for Cloud Functions)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
        cb(null, false);
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Firebase Functions API is running',
    timestamp: new Date().toISOString()
  });
});

// Routes

// GET all resumes
app.get('/resumes', async (req, res) => {
  try {
    const resumesSnapshot = await db.collection('resumes').get();
    const resumes = [];
    
    resumesSnapshot.forEach(doc => {
      resumes.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      data: resumes,
      count: resumes.length
    });
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching resumes',
      error: error.message
    });
  }
});

// GET all projects
app.get('/projects', async (req, res) => {
  try {
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
      data: projects,
      count: projects.length
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
});

// GET projects by user ID
app.get('/projects/user/:userId', async (req, res) => {
  try {
    const projectsSnapshot = await db.collection('projects')
      .where('userId', '==', req.params.userId)
      .get();
    
    const projects = [];
    projectsSnapshot.forEach(doc => {
      projects.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      data: projects,
      count: projects.length
    });
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user projects',
      error: error.message
    });
  }
});

// GET single project by ID
app.get('/projects/:id', async (req, res) => {
  try {
    const projectDoc = await db.collection('projects').doc(req.params.id).get();
    
    if (!projectDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: projectDoc.id,
        ...projectDoc.data()
      }
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project',
      error: error.message
    });
  }
});

// POST new project
app.post('/projects', async (req, res) => {
  try {
    const { name, technologies, short_description, long_description, github_url, live_url, image_url, userId, status = 'completed' } = req.body;
    
    if (!name || !technologies || !short_description || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Name, technologies, short description, and userId are required'
      });
    }

    const newProject = {
      userId,
      name,
      technologies: technologies.split(',').map((tech) => tech.trim()),
      short_description,
      long_description: long_description || '',
      github_url: github_url || '',
      live_url: live_url || '',
      image_url: image_url || '',
      status, // 'completed' or 'in-progress'
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('projects').add(newProject);
    const createdProject = {
      id: docRef.id,
      ...newProject
    };

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: createdProject
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating project',
      error: error.message
    });
  }
});

// PUT update project
app.put('/projects/:id', async (req, res) => {
  try {
    const { name, technologies, short_description, long_description, github_url, live_url, image_url, status } = req.body;
    
    const projectRef = db.collection('projects').doc(req.params.id);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const existingProject = projectDoc.data();
    
    const updatedProject = {
      ...existingProject,
      name: name || existingProject.name,
      technologies: technologies ? technologies.split(',').map((tech) => tech.trim()) : existingProject.technologies,
      short_description: short_description || existingProject.short_description,
      long_description: long_description || existingProject.long_description,
      github_url: github_url || existingProject.github_url,
      live_url: live_url || existingProject.live_url,
      image_url: image_url || existingProject.image_url,
      status: status || existingProject.status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await projectRef.update(updatedProject);

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: {
        id: projectDoc.id,
        ...updatedProject
      }
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating project',
      error: error.message
    });
  }
});

// DELETE project
app.delete('/projects/:id', async (req, res) => {
  try {
    const projectRef = db.collection('projects').doc(req.params.id);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    await projectRef.delete();

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting project',
      error: error.message
    });
  }
});

// GET single resume by ID
app.get('/resumes/:id', async (req, res) => {
  try {
    const resumeDoc = await db.collection('resumes').doc(req.params.id).get();
    
    if (!resumeDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: resumeDoc.id,
        ...resumeDoc.data()
      }
    });
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching resume',
      error: error.message
    });
  }
});

// GET single resume by user ID (for checking if user already has a resume)
app.get('/resumes/user/:userId', async (req, res) => {
  try {
    const resumesSnapshot = await db.collection('resumes')
      .where('userId', '==', req.params.userId)
      .limit(1)
      .get();
    
    if (resumesSnapshot.empty) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    const resumeDoc = resumesSnapshot.docs[0];
    res.json({
      success: true,
      data: {
        id: resumeDoc.id,
        ...resumeDoc.data()
      }
    });
  } catch (error) {
    console.error('Error fetching user resume:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user resume',
      error: error.message
    });
  }
});

// POST upload resume (using Firebase Storage)
app.post('/resumes', upload.single('resumeFile'), async (req, res) => {
  try {
    const { name, email, title, description, skills, experience, userId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Resume file is required'
      });
    }

    // Check if user already has a resume
    const existingResumesSnapshot = await db.collection('resumes')
      .where('userId', '==', userId)
      .limit(1)
      .get();

    let isUpdate = false;
    let existingResumeId = null;

    if (!existingResumesSnapshot.empty) {
      isUpdate = true;
      existingResumeId = existingResumesSnapshot.docs[0].id;
    }

    // Upload file to Firebase Storage
    const bucket = admin.storage().bucket();
    const fileName = `resumes/${uuidv4()}-${req.file.originalname}`;
    const file = bucket.file(fileName);
    
    await file.save(req.file.buffer, {
      metadata: {
        contentType: req.file.mimetype,
      }
    });

    // Get download URL
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2500' // Far future expiration
    });

    const resumeData = {
      name: name || 'Unknown',
      email: email || 'no-email@example.com',
      title: title || '',
      description: description || '',
      skills: skills || '',
      experience: experience || '',
      userId: userId,
      filename: fileName,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      downloadUrl: url,
      views: isUpdate ? existingResumesSnapshot.docs[0].data().views : 0,
      downloads: isUpdate ? existingResumesSnapshot.docs[0].data().downloads : 0,
      uploadedAt: isUpdate ? existingResumesSnapshot.docs[0].data().uploadedAt : admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isUpdated: isUpdate
    };

    let result;
    if (isUpdate) {
      // Update existing resume
      await db.collection('resumes').doc(existingResumeId).update(resumeData);
      result = {
        id: existingResumeId,
        ...resumeData
      };
    } else {
      // Create new resume
      const docRef = await db.collection('resumes').add(resumeData);
      result = {
        id: docRef.id,
        ...resumeData
      };
    }

    res.status(isUpdate ? 200 : 201).json({
      success: true,
      message: isUpdate ? 'Resume updated successfully' : 'Resume uploaded successfully',
      data: result,
      isUpdate: isUpdate
    });

  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading resume',
      error: error.message
    });
  }
});

// POST increment view count
app.post('/resumes/:id/view', async (req, res) => {
  try {
    const resumeRef = db.collection('resumes').doc(req.params.id);
    const resumeDoc = await resumeRef.get();
    
    if (!resumeDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    await resumeRef.update({
      views: admin.firestore.FieldValue.increment(1)
    });

    res.json({
      success: true,
      message: 'View count incremented'
    });

  } catch (error) {
    console.error('Error incrementing view count:', error);
    res.status(500).json({
      success: false,
      message: 'Error incrementing view count',
      error: error.message
    });
  }
});

// GET search resumes
app.get('/resumes/search/:query', async (req, res) => {
  try {
    const query = req.params.query.toLowerCase();
    const resumesSnapshot = await db.collection('resumes').get();
    const resumes = [];
    
    resumesSnapshot.forEach(doc => {
      const resumeData = doc.data();
      const searchText = `${resumeData.name} ${resumeData.title} ${resumeData.description} ${resumeData.skills} ${resumeData.experience}`.toLowerCase();
      
      if (searchText.includes(query)) {
        resumes.push({
          id: doc.id,
          ...resumeData
        });
      }
    });

    res.json({
      success: true,
      data: resumes,
      count: resumes.length
    });

  } catch (error) {
    console.error('Error searching resumes:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching resumes',
      error: error.message
    });
  }
});

// DELETE resume
app.delete('/resumes/:id', async (req, res) => {
  try {
    const resumeDoc = await db.collection('resumes').doc(req.params.id).get();
    
    if (!resumeDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    const resumeData = resumeDoc.data();
    
    // Delete file from Firebase Storage
    if (resumeData.filename) {
      const bucket = admin.storage().bucket();
      const file = bucket.file(resumeData.filename);
      await file.delete();
    }

    // Delete from Firestore
    await db.collection('resumes').doc(req.params.id).delete();

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting resume',
      error: error.message
    });
  }
});

// Export the Express app as a Firebase Function
export const api = functions.https.onRequest(app);
