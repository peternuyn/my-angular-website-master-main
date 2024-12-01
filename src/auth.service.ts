import { Injectable, inject, signal } from "@angular/core";
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, user } from "@angular/fire/auth";
import { Observable, from } from "rxjs";

import { User } from "./app/account/register/register.component";



@Injectable(
    {
        providedIn: 'root'
    })
export class AuthService {
    firebaseAuth = inject(Auth);
    user$ = user(this.firebaseAuth);
    currentUserSig = signal<User | undefined>(undefined); // Signal that emits the current user
    
    
    register(email: string, username: string, password: string): Observable<void> {
        const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password).then(
            response => updateProfile(response.user, { displayName: username }).then(() => {
            })
        );
        return from(promise);

    }


    login(email:string, password: string): Observable<void> {
        const promise = signInWithEmailAndPassword(
        this.firebaseAuth, email, password
        ).then(() => {});
        return from(promise);
    }
}