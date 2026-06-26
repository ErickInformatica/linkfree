import { Injectable, inject, signal } from '@angular/core';
import {
  Auth, GoogleAuthProvider,
  signInWithRedirect, getRedirectResult,
  signOut, onAuthStateChanged, User,
} from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  currentUser = signal<User | null>(null);
  loading = signal(true);

  constructor() {
    // Restore persisted session on every load
    onAuthStateChanged(this.auth, user => {
      this.currentUser.set(user);
      this.loading.set(false);
    });

    // Handle redirect result (after Google redirects back)
    getRedirectResult(this.auth).catch(() => {});
  }

  async loginWithGoogle(): Promise<void> {
    await signInWithRedirect(this.auth, new GoogleAuthProvider());
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  isLoggedIn(): boolean {
    return !!this.currentUser();
  }

  /** Resolves once Firebase has restored session state */
  waitForAuth(): Promise<User | null> {
    return new Promise(resolve => {
      if (!this.loading()) { resolve(this.currentUser()); return; }
      const unsub = onAuthStateChanged(this.auth, user => {
        unsub();
        resolve(user);
      });
    });
  }
}
