# My Resume Website

A modern, full-stack Angular application for creating, sharing, and managing professional resumes and projects. Built with Angular 18, Firebase Functions, and Firestore database.

## 🌟 Features

### Resume Management
- **Upload Resumes**: Upload PDF resumes with detailed information
- **Resume Sharing**: Publicly share resumes with other users
- **Resume Search**: Search through all shared resumes
- **Download Resumes**: Download resumes as formatted text files
- **View Tracking**: Track how many times your resume has been viewed
- **Resume Updates**: Update existing resumes with new information

### Project Management
- **Create Projects**: Add your projects with descriptions, technologies, and links
- **Project Portfolio**: Display your projects with status (completed/in-progress)
- **Project CRUD**: Full create, read, update, delete functionality
- **Technology Tags**: Organize projects by technologies used

### User Features
- **Authentication**: Secure user registration and login with Firebase Auth
- **User Profiles**: Customizable user profiles with personal information
- **Template System**: Professional resume template generation
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS and DaisyUI

### Technical Features
- **Firebase Backend**: Serverless architecture with Firebase Functions
- **Real-time Database**: Firestore for data persistence
- **Auto-deployment**: GitHub Actions for continuous deployment
- **Modern UI**: Beautiful, responsive design with Tailwind CSS

## 🚀 Live Demo

Visit the live application: [https://myresume01.web.app](https://myresume01.web.app)

## 🛠️ Tech Stack

### Frontend
- **Angular 18**: Modern frontend framework
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **DaisyUI**: Component library for Tailwind CSS
- **RxJS**: Reactive programming library

### Backend
- **Firebase Functions**: Serverless backend functions
- **Firestore**: NoSQL cloud database
- **Firebase Auth**: User authentication
- **Firebase Hosting**: Static web hosting

### Development Tools
- **Nx**: Monorepo build system
- **Jest**: Testing framework
- **Prettier**: Code formatting
- **GitHub Actions**: CI/CD pipeline

## 📋 Prerequisites

Before running this project locally, make sure you have:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **Firebase CLI** (v12 or higher)
- **Git**

## 🔧 Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd my-angular-website
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

#### Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable the following services:
   - **Authentication** (Email/Password)
   - **Firestore Database**
   - **Functions**
   - **Hosting**

#### Configure Firebase
1. Install Firebase CLI globally:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init
   ```
   - Select your project
   - Choose Functions and Hosting
   - Use JavaScript for Functions
   - Set public directory to `dist/my-angular-website/browser`
   - Configure as single-page app: Yes

4. Update the Firebase configuration in your Angular app:
   - Go to Project Settings → General → Your apps
   - Add a web app if not already added
   - Copy the Firebase config object
   - Update `src/app/app.config.ts` with your Firebase config

### 4. Environment Configuration

Create a `.env` file in the root directory (if needed for local development):

```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

### 5. Run the Application

#### Development Server
```bash
npm start
```
The application will be available at `http://localhost:4200`

#### Build for Production
```bash
npm run build
```

#### Watch Mode (for development)
```bash
npm run watch
```

### 6. Deploy to Firebase

#### Deploy Everything
```bash
firebase deploy
```

#### Deploy Only Functions
```bash
firebase deploy --only functions
```

#### Deploy Only Hosting
```bash
firebase deploy --only hosting
```

## 📁 Project Structure

```
my-angular-website/
├── src/
│   ├── app/
│   │   ├── about/                 # About page component
│   │   ├── account/               # Authentication components
│   │   ├── faq/                   # FAQ page component
│   │   ├── header/                # Navigation header
│   │   ├── home/                  # Home page component
│   │   ├── my_template/           # Resume template system
│   │   ├── project-management/    # Project CRUD operations
│   │   ├── projects/              # Project display
│   │   ├── resume-share/          # Resume sharing functionality
│   │   └── app.component.*        # Main app component
│   ├── services/                  # Angular services
│   │   ├── auth.service.ts        # Authentication service
│   │   ├── project.service.ts     # Project management service
│   │   └── resume.service.ts      # Resume management service
│   └── assets/                    # Static assets
├── functions/                     # Firebase Functions
│   ├── index.js                   # Main functions file
│   └── package.json               # Functions dependencies
├── .github/workflows/             # GitHub Actions workflows
├── firebase.json                  # Firebase configuration
├── .firebaserc                    # Firebase project settings
└── package.json                   # Project dependencies
```

## 🔐 Environment Variables

For local development, you may need to set up environment variables. Create a `.env` file in the root directory:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

## 🚀 Deployment

### Automatic Deployment (GitHub Actions)

The project includes GitHub Actions workflows for automatic deployment:

1. **Set up Firebase CI Token**:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate a new private key
   - Add the token as a GitHub secret named `FIREBASE_TOKEN`

2. **Push to Main Branch**:
   - The workflow will automatically build and deploy on every push to `main`

### Manual Deployment

```bash
# Build the application
npm run build

# Deploy to Firebase
firebase deploy
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📝 API Endpoints

The application uses Firebase Functions for the backend API:

### Resume Endpoints
- `GET /api/resumes` - Get all resumes
- `GET /api/resumes/:id` - Get specific resume
- `GET /api/resumes/user/:userId` - Get user's resume
- `POST /api/resumes/upload` - Upload/update resume
- `DELETE /api/resumes/:id` - Delete resume
- `GET /api/resumes/search/:query` - Search resumes
- `GET /api/resumes/:id/download` - Download resume
- `POST /api/resumes/:id/view` - Increment view count

### Project Endpoints
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get specific project
- `GET /api/projects/user/:userId` - Get user's projects
- `POST /api/projects/create` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Health Check
- `GET /api/health` - Health check endpoint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/my-angular-website/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

## 🙏 Acknowledgments

- [Angular](https://angular.io/) - The web framework used
- [Firebase](https://firebase.google.com/) - Backend services
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [DaisyUI](https://daisyui.com/) - Component library
- [Nx](https://nx.dev/) - Build system

---

**Happy coding! 🚀** 