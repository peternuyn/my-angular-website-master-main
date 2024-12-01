import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDYEbWBA_2lpvwff8KDIrQKSS2dLVfLVRc",
  authDomain: "my-resume-website-1.firebaseapp.com",
  projectId: "my-resume-website-1",
  storageBucket: "my-resume-website-1.firebasestorage.app",
  messagingSenderId: "707784190739",
  appId: "1:707784190739:web:13a2fd46226cbe9025c8e6",
  measurementId: "G-FL8G7BQKRM"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth())
  ]
};
