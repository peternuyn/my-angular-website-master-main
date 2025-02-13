import { Injectable, inject, signal } from "@angular/core";
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, user } from "@angular/fire/auth";
import { Firestore, doc, setDoc, getDoc } from "@angular/fire/firestore";
import { Observable, from } from "rxjs";
import { User } from "../app/account/register/register.component"; // Adjust path as needed

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  firebaseAuth = inject(Auth);
  firestore = inject(Firestore);  // Inject Firestore instance
  user$ = user(this.firebaseAuth);  // Reactive user state from Firebase Auth
  currentUserSig = signal<User | undefined>(undefined);  // Signal to emit the current user

  constructor() {
    // Listen for auth state changes and update currentUserSig
    this.firebaseAuth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        this.currentUserSig.set({
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? undefined,
          displayName: firebaseUser.displayName ?? undefined,
        });
      } else {
        this.currentUserSig.set(undefined);
      }
    });
  }

  // Register a new user
  register(email: string, username: string, password: string): Observable<void> {
    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password).then(response => {
      // Update the display name after registration
      return updateProfile(response.user, { displayName: username });
    });
    return from(promise);  // Return as an Observable
  }

  // Login an existing user
  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password).then(() => {});
    return from(promise);  // Return as an Observable
  }

  // Get user data from Firestore by UID
  getUserData(uid: string): Observable<any> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    return from(getDoc(userDocRef));  // Returns Observable for the user document
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
    const currentUser = this.firebaseAuth.currentUser;
    return currentUser
      ? {
          email: currentUser.email || '',
          uid: currentUser.uid,
          admin: false, // Adjust if you have a way to determine admin status
        }
      : null;
  }
  
  // Log out the user
  logout(): Observable<void> {
    const promise = this.firebaseAuth.signOut();
    return from(promise);  // Return as an Observable
  }
}
