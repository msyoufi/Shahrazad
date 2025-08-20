import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { Auth, EmailAuthProvider, onAuthStateChanged, reauthenticateWithCredential, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, Unsubscribe, updatePassword, type User } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private auth = inject(Auth);

  private currentUser = signal<User | null>(null);

  private unsubscribe: Unsubscribe | undefined;

  get user(): User | null {
    return this.currentUser();
  }

  constructor() {
    console.log('init users service')
    this.subscribeToUserChanges();
  }

  private subscribeToUserChanges(): void {
    this.unsubscribe = onAuthStateChanged(this.auth, (user) => {
      this.currentUser.set(user);
    });
  }

  // awaitAuthStateReady(): () => Promise<void> {
  //   return () => this.auth.authStateReady();
  // }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  async reauthenticatUser(user: User, email: string, password: string): Promise<void> {
    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(user, credential);
  }

  changePassword(user: User, newPassword: string): Promise<void> {
    return updatePassword(user, newPassword);
  }

  resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
  }

  ngOnDestroy(): void {
    console.log('destroy user service')
    this.unsubscribe && this.unsubscribe();
  }
}
