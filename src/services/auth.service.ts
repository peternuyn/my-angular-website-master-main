import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  user,
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { User } from '../app/account/register/register.component'; // Adjust path as needed

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  firebaseAuth = inject(Auth);
  firestore = inject(Firestore); // Inject Firestore instance
  user$ = user(this.firebaseAuth); // Reactive user state from Firebase Auth
  currentUserSig = signal<User | undefined>(undefined); // Signal to emit the current user

  constructor() {
    // Check if there's a user stored in localStorage and restore it if available
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      this.currentUserSig.set({
        uid: parsedUser.uid,
        email: parsedUser.email ?? undefined,
        displayName: parsedUser.displayName ?? undefined,
      });
    }

    // Listen for auth state changes to update the signal and localStorage
    this.firebaseAuth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        this.currentUserSig.set({
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? undefined,
          displayName: firebaseUser.displayName ?? undefined,
        });
        // Save user to localStorage on login
        localStorage.setItem('user', JSON.stringify(firebaseUser));
      } else {
        this.currentUserSig.set(undefined);
        // Remove user from localStorage on logout
        localStorage.removeItem('user');
      }
    });
  }

  // Register a new user
  register(
    email: string,
    username: string,
    password: string
  ): Observable<void> {
    const promise = createUserWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then((response) => {
      // Update the display name after registration
      return updateProfile(response.user, { displayName: username });
    });
    return from(promise); // Return as an Observable
  }

  // Login an existing user
  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then(() => {});
    return from(promise); // Return as an Observable
  }

  // Get user data from Firestore by UID
  getUserData(uid: string): Observable<any> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    return from(getDoc(userDocRef)); // Returns Observable for the user document
  }

  // Save user profile data to Firestore
  saveUserProfile = async (uid: string, profileData: any) => {
    const userRef = doc(this.firestore, 'users', uid);
    try {
      await setDoc(userRef, profileData);
      console.log('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  // Get current authenticated user from signal
  getCurrentUser(): User | null {
    // Access the current user from the signal instead of firebaseAuth.currentUser directly
    return this.currentUserSig() ?? null;
  }

  // Log out the user
  logout(): Observable<void> {
    const promise = this.firebaseAuth.signOut();
    return from(promise); // Return as an Observable
  }
}
