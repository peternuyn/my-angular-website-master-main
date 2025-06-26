# Firebase Backend Hosting Guide

This guide explains how to host your Express.js backend on Firebase Functions, providing a complete serverless solution for your Angular website.

## 🚀 Overview

Firebase Functions allows you to run your backend code on Google's infrastructure without managing servers. This provides:

- ✅ **Serverless Architecture** - No server management required
- ✅ **Automatic Scaling** - Handles traffic spikes automatically
- ✅ **Global Distribution** - Runs close to your users
- ✅ **Free Tier** - Generous free usage limits
- ✅ **Integrated Services** - Easy access to Firestore, Storage, Auth

## 📋 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Firebase      │    │   Firebase      │
│   (Angular)     │───►│   Hosting       │───►│   Functions     │
│                 │    │                 │    │   (Backend)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Firestore     │    │   Storage       │
                       │   (Database)    │    │   (Files)       │
                       └─────────────────┘    └─────────────────┘
```

## 🛠️ Setup Instructions

### 1. **Enable Firebase Services**

Go to Firebase Console and enable these services:

#### **Firestore Database**
1. Go to **Firestore Database** → **Create Database**
2. Choose **Start in test mode** (for development)
3. Select a location close to your users

#### **Storage**
1. Go to **Storage** → **Get Started**
2. Choose **Start in test mode** (for development)
3. Select the same location as Firestore

#### **Functions**
1. Go to **Functions** → **Get Started**
2. Enable billing (required for Functions)
3. Select the same location as other services

### 2. **Deploy Functions**

```bash
# Build and deploy functions
firebase deploy --only functions

# Deploy everything (hosting + functions)
firebase deploy
```

### 3. **Update Security Rules**

#### **Firestore Rules** (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to resumes and projects
    match /resumes/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /projects/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

#### **Storage Rules** (`storage.rules`)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read access to resume files
    match /resumes/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 🔧 Configuration

### **Firebase Configuration** (`firebase.json`)
```json
{
  "hosting": {
    "site": "myresume01",
    "public": "dist/my-angular-website/browser",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "ignore": [
        "node_modules",
        ".git",
        "firebase-debug.log",
        "firebase-debug.*.log",
        "*.local"
      ],
      "predeploy": [
        "npm --prefix \"$RESOURCE_DIR\" run lint",
        "npm --prefix \"$RESOURCE_DIR\" run build"
      ]
    }
  ]
}
```

### **Environment Variables**

Set environment variables in Firebase Console:

1. Go to **Functions** → **Configuration**
2. Add these variables:
   ```
   FIREBASE_PROJECT_ID=my-resume-website-1
   NODE_ENV=production
   ```

## 📊 API Endpoints

Your Firebase Functions provide these endpoints:

### **Resumes**
- `GET /api/resumes` - Get all resumes
- `GET /api/resumes/:id` - Get specific resume
- `GET /api/resumes/user/:userId` - Get user's resume
- `POST /api/resumes` - Upload resume
- `POST /api/resumes/:id/view` - Increment view count
- `DELETE /api/resumes/:id` - Delete resume
- `GET /api/resumes/search/:query` - Search resumes

### **Projects**
- `GET /api/projects` - Get all projects
- `GET /api/projects/user/:userId` - Get user's projects
- `GET /api/projects/:id` - Get specific project
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### **Health Check**
- `GET /api/health` - Check API status

## 🔄 Deployment Workflow

### **Automatic Deployment**
Your existing GitHub Actions workflows will automatically deploy:

1. **Frontend** → Firebase Hosting
2. **Backend** → Firebase Functions

### **Manual Deployment**
```bash
# Deploy everything
firebase deploy

# Deploy only functions
firebase deploy --only functions

# Deploy only hosting
firebase deploy --only hosting

# Deploy specific function
firebase deploy --only functions:api
```

## 💰 Pricing & Limits

### **Free Tier (Spark Plan)**
- **Functions**: 125K invocations/month
- **Firestore**: 1GB storage, 50K reads/day, 20K writes/day
- **Storage**: 5GB storage, 1GB downloads/day
- **Hosting**: 10GB storage, 360MB/day

### **Paid Tier (Blaze Plan)**
- Pay only for what you use beyond free tier
- Functions: $0.40 per million invocations
- Firestore: $0.18 per 100K reads, $0.18 per 100K writes
- Storage: $0.026 per GB/month

## 🔒 Security Features

### **Authentication**
- Integrate with Firebase Auth
- Protect sensitive endpoints
- User-specific data access

### **CORS Configuration**
```typescript
app.use(cors({ 
  origin: [
    'https://my-resume-website-1.web.app',
    'https://my-resume-website-1.firebaseapp.com',
    'http://localhost:4200' // Development
  ] 
}));
```

### **File Upload Security**
- File type validation (PDF only)
- File size limits (5MB)
- Secure download URLs with expiration

## 📈 Performance Optimization

### **Function Optimization**
- **Cold Start Reduction**: Keep functions warm
- **Memory Allocation**: Optimize for your workload
- **Timeout Settings**: Set appropriate timeouts

### **Database Optimization**
- **Indexing**: Create indexes for queries
- **Pagination**: Implement cursor-based pagination
- **Caching**: Use Firebase Cache

### **Storage Optimization**
- **Compression**: Compress files before upload
- **CDN**: Use Firebase Storage CDN
- **Cleanup**: Implement automatic file cleanup

## 🚨 Monitoring & Debugging

### **Firebase Console**
- **Functions**: Monitor execution times and errors
- **Firestore**: Track read/write operations
- **Storage**: Monitor file uploads/downloads

### **Logs**
```bash
# View function logs
firebase functions:log

# View real-time logs
firebase functions:log --tail
```

### **Performance Monitoring**
- **Function Metrics**: Execution time, memory usage
- **Database Metrics**: Query performance
- **Storage Metrics**: Upload/download speeds

## 🔄 Migration from Express.js Server

### **What Changed**
1. **File Storage**: Local files → Firebase Storage
2. **API Endpoints**: `/api/*` → Firebase Functions
3. **Database**: Same Firestore (no change needed)
4. **Deployment**: Manual → Automatic via GitHub Actions

### **Benefits**
- ✅ **No Server Management**: Fully serverless
- ✅ **Automatic Scaling**: Handles traffic spikes
- ✅ **Global Distribution**: Better performance
- ✅ **Integrated Services**: Easy Firebase integration
- ✅ **Cost Effective**: Pay only for usage

## 🐛 Troubleshooting

### **Common Issues**

#### 1. **Function Timeout**
```typescript
// Increase timeout in functions/src/index.ts
export const api = functions
  .runWith({
    timeoutSeconds: 540, // 9 minutes max
    memory: '1GB'
  })
  .https.onRequest(app);
```

#### 2. **CORS Errors**
```typescript
// Update CORS configuration
app.use(cors({ 
  origin: true, // Allow all origins in development
  credentials: true 
}));
```

#### 3. **File Upload Issues**
```typescript
// Check file size and type
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files allowed'));
    }
  }
});
```

### **Debug Commands**
```bash
# Test functions locally
firebase emulators:start

# Deploy with verbose logging
firebase deploy --only functions --debug

# Check function status
firebase functions:list
```

## 📚 Best Practices

### **Function Design**
- Keep functions focused and small
- Use proper error handling
- Implement request validation
- Use environment variables for configuration

### **Database Design**
- Design efficient queries
- Use appropriate indexes
- Implement data validation
- Plan for scalability

### **Security**
- Validate all inputs
- Implement proper authentication
- Use secure file uploads
- Regular security audits

## 🎯 Next Steps

### **Advanced Features**
1. **Real-time Updates**: Use Firestore listeners
2. **Push Notifications**: Firebase Cloud Messaging
3. **Analytics**: Firebase Analytics integration
4. **A/B Testing**: Firebase Remote Config

### **Monitoring & Alerting**
1. **Error Tracking**: Sentry integration
2. **Performance Monitoring**: Firebase Performance
3. **Custom Metrics**: Cloud Monitoring
4. **Alerting**: Cloud Monitoring alerts

### **Security Enhancements**
1. **Custom Claims**: Advanced user roles
2. **API Keys**: Secure API access
3. **Rate Limiting**: Prevent abuse
4. **Audit Logging**: Track all operations

## 📖 Additional Resources

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Serverless Architecture Best Practices](https://firebase.google.com/docs/functions/best-practices) 