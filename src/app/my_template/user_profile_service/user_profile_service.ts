import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, updateDoc } from '@angular/fire/firestore';
import { inject } from '@angular/core';


@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private firestore = inject(Firestore);


  /**
   * Get the user profile data
   * @param uid 
   * @returns 
   */
  getUserProfile(uid: string) {
    const userRef = doc(this.firestore, 'users', uid); // Reference to the user document
    return userRef; // Return the reference
  }

  /**
   * Save the user profile data
   * @param uid The user ID
   * @param profileData 
   * @returns 
   */
  saveUserProfile(uid: string, profileData: any) {
    const userRef = doc(this.firestore, 'users', uid); // Reference to the user document
    return setDoc(userRef, profileData); // Ensure profileData is an object
  }
}
