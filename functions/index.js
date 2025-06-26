const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const multer = require('multer');
const path = require('path');

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Helper function to handle file uploads
const uploadFileToStorage = async (file, userId) => {
  const fileName = `${userId}_${Date.now()}_${file.originalname}`;
  const fileUpload = bucket.file(`resumes/${fileName}`);
  
  const blobStream = fileUpload.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  return new Promise((resolve, reject) => {
    blobStream.on('error', (error) => {
      reject(error);
    });

    blobStream.on('finish', async () => {
      // Make the file public
      await fileUpload.makePublic();
      
      // Get the public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/resumes/${fileName}`;
      
      resolve({
        filename: fileName,
        originalName: file.originalname,
        downloadUrl: publicUrl,
        fileSize: file.size
      });
    });

    blobStream.end(file.buffer);
  });
};

// Resume Management APIs - Matching Angular service expectations
const getPublicResumes = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const resumesSnapshot = await db.collection('resumes')
        .where('isPublic', '==', true)
        .orderBy('uploadedAt', 'desc')
        .limit(20)
        .get();

      const resumes = [];
      resumesSnapshot.forEach(doc => {
        const data = doc.data();
        resumes.push({
          id: doc.id,
          name: data.name,
          email: data.email,
          title: data.title,
          description: data.description,
          skills: data.skills,
          experience: data.experience,
          filename: data.filename,
          originalName: data.originalName,
          downloadUrl: data.downloadUrl,
          fileSize: data.fileSize,
          uploadedAt: data.uploadedAt,
          updatedAt: data.updatedAt,
          downloads: data.downloads || 0,
          views: data.views || 0,
          isUpdated: data.isUpdated || false
        });
      });

      res.status(200).json({
        success: true,
        resumes
      });
    } catch (error) {
      console.error('Error getting public resumes:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
});

const getResume = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Resume ID is required'
        });
      }

      const resumeDoc = await db.collection('resumes').doc(id).get();
      
      if (!resumeDoc.exists) {
        return res.status(404).json({
          success: false,
          error: 'Resume not found'
        });
      }

      const data = resumeDoc.data();
      res.status(200).json({
        success: true,
        resume: {
          id: resumeDoc.id,
          name: data.name,
          email: data.email,
          title: data.title,
          description: data.description,
          skills: data.skills,
          experience: data.experience,
          filename: data.filename,
          originalName: data.originalName,
          downloadUrl: data.downloadUrl,
          fileSize: data.fileSize,
          uploadedAt: data.uploadedAt,
          updatedAt: data.updatedAt,
          downloads: data.downloads || 0,
          views: data.views || 0,
          isUpdated: data.isUpdated || false
        }
      });
    } catch (error) {
      console.error('Error getting resume:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
});

const getUserResume = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { userId } = req.params;
      
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
          error: 'No resume found for this user'
        });
      }

      const doc = resumesSnapshot.docs[0];
      const data = doc.data();
      
      res.status(200).json({
        success: true,
        resume: {
          id: doc.id,
          name: data.name,
          email: data.email,
          title: data.title,
          description: data.description,
          skills: data.skills,
          experience: data.experience,
          filename: data.filename,
          originalName: data.originalName,
          downloadUrl: data.downloadUrl,
          fileSize: data.fileSize,
          uploadedAt: data.uploadedAt,
          updatedAt: data.updatedAt,
          downloads: data.downloads || 0,
          views: data.views || 0,
          isUpdated: data.isUpdated || false
        }
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

const uploadResume = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { name, email, title, description, skills, experience, userId } = req.body;
      
      if (!name || !email || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Name, email, and userId are required'
        });
      }

      // Check if user already has a resume
      const existingResume = await db.collection('resumes')
        .where('userId', '==', userId)
        .limit(1)
        .get();

      let resumeData = {
        name,
        email,
        title: title || '',
        description: description || '',
        skills: skills || '',
        experience: experience || '',
        userId,
        uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        downloads: 0,
        views: 0,
        isPublic: true,
        isUpdated: false
      };

      if (!existingResume.empty) {
        // Update existing resume
        const docId = existingResume.docs[0].id;
        await db.collection('resumes').doc(docId).update({
          ...resumeData,
          isUpdated: true
        });

        res.status(200).json({
          success: true,
          message: 'Resume updated successfully',
          resumeId: docId
        });
      } else {
        // Create new resume
        const resumeRef = await db.collection('resumes').add(resumeData);

        res.status(201).json({
          success: true,
          message: 'Resume uploaded successfully',
          resumeId: resumeRef.id
        });
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
});

const viewResume = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Resume ID is required'
        });
      }

      await db.collection('resumes').doc(id).update({
        views: admin.firestore.FieldValue.increment(1)
      });

      res.status(200).json({
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
});

const deleteResume = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Resume ID is required'
        });
      }

      await db.collection('resumes').doc(id).delete();

      res.status(200).json({
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

const searchResumes = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { query } = req.params;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }

      const resumesSnapshot = await db.collection('resumes')
        .where('isPublic', '==', true)
        .get();

      const resumes = [];
      resumesSnapshot.forEach(doc => {
        const data = doc.data();
        const searchText = `${data.name} ${data.title} ${data.description} ${data.skills}`.toLowerCase();
        
        if (searchText.includes(query.toLowerCase())) {
          resumes.push({
            id: doc.id,
            name: data.name,
            email: data.email,
            title: data.title,
            description: data.description,
            skills: data.skills,
            experience: data.experience,
            filename: data.filename,
            originalName: data.originalName,
            downloadUrl: data.downloadUrl,
            fileSize: data.fileSize,
            uploadedAt: data.uploadedAt,
            updatedAt: data.updatedAt,
            downloads: data.downloads || 0,
            views: data.views || 0,
            isUpdated: data.isUpdated || false
          });
        }
      });

      res.status(200).json({
        success: true,
        resumes
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

// Health check endpoint
const healthCheck = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    res.status(200).json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString()
    });
  });
});

// User Management APIs
const createUser = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { email, password, displayName } = req.body;
      
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName
      });

      // Create user profile in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        email,
        displayName,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        projects: [],
        resumes: []
      });

      res.status(201).json({
        success: true,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName
        }
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
});

const getUserProfile = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { uid } = req.query;
      
      if (!uid) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      const userDoc = await db.collection('users').doc(uid).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        user: userDoc.data()
      });
    } catch (error) {
      console.error('Error getting user profile:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
});

// Project Management APIs
const createProject = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { uid, project } = req.body;
      
      if (!uid || !project) {
        return res.status(400).json({
          success: false,
          error: 'User ID and project data are required'
        });
      }

      const projectRef = await db.collection('projects').add({
        ...project,
        userId: uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Add project to user's projects array
      await db.collection('users').doc(uid).update({
        projects: admin.firestore.FieldValue.arrayUnion(projectRef.id)
      });

      res.status(201).json({
        success: true,
        projectId: projectRef.id
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

const getUserProjects = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { uid } = req.query;
      
      if (!uid) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      const projectsSnapshot = await db.collection('projects')
        .where('userId', '==', uid)
        .orderBy('createdAt', 'desc')
        .get();

      const projects = [];
      projectsSnapshot.forEach(doc => {
        projects.push({
          id: doc.id,
          ...doc.data()
        });
      });

      res.status(200).json({
        success: true,
        projects
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

const updateProject = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { projectId, updates } = req.body;
      
      if (!projectId || !updates) {
        return res.status(400).json({
          success: false,
          error: 'Project ID and updates are required'
        });
      }

      await db.collection('projects').doc(projectId).update({
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      res.status(200).json({
        success: true,
        message: 'Project updated successfully'
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

const deleteProject = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { projectId, uid } = req.body;
      
      if (!projectId || !uid) {
        return res.status(400).json({
          success: false,
          error: 'Project ID and User ID are required'
        });
      }

      // Delete the project
      await db.collection('projects').doc(projectId).delete();

      // Remove project from user's projects array
      await db.collection('users').doc(uid).update({
        projects: admin.firestore.FieldValue.arrayRemove(projectId)
      });

      res.status(200).json({
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

// Export all functions
module.exports = {
  getPublicResumes,
  getResume,
  getUserResume,
  uploadResume,
  viewResume,
  deleteResume,
  searchResumes,
  healthCheck,
  createUser,
  getUserProfile,
  createProject,
  getUserProjects,
  updateProject,
  deleteProject
}; 