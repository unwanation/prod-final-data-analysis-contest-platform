import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import type { ProfileUpdate, User, UserRole } from '../models';

const STORAGE_KEY = 'nado_user';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly platformId = inject(PLATFORM_ID);

  readonly user = signal<User | null>(this.loadUser());

  readonly isAuthenticated = computed(() => this.user() !== null);

  readonly role = computed<UserRole | null>(() => this.user()?.role ?? null);

  login(email: string, _password: string, role: UserRole = 'participant'): boolean {
    const user: User = {
      id: crypto.randomUUID(),
      email,
      name: email.split('@')[0],
      role,
      avatarUrl: undefined,
      bio: '',
    };
    this.user.set(user);
    this.persistUser(user);
    return true;
  }

  register(email: string, password: string, role: UserRole = 'participant'): boolean {
    return this.login(email, password, role);
  }

  updateProfile(update: ProfileUpdate): boolean {
    const current = this.user();
    if (!current) return false;

    const updated: User = {
      ...current,
      name: update.name ?? current.name,
      avatarUrl: update.avatarUrl ?? current.avatarUrl,
      bio: update.bio ?? current.bio,
    };
    this.user.set(updated);
    this.persistUser(updated);
    return true;
  }

  logout(): void {
    this.user.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  private loadUser(): User | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  private persistUser(user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  }
}
