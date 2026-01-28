import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import type { User, UserRole } from '../models';

export interface LoginRequest {
  email: string;
  password: string;
  role?: UserRole;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly mockUsers = new Map<string, { password: string; user: User }>();

  constructor() {
    this.mockUsers.set('demo@example.com', {
      password: 'demo123',
      user: {
        id: 'demo-user-1',
        email: 'demo@example.com',
        name: 'Demo User',
        role: 'participant',
        bio: 'Энтузиаст data science',
      },
    });
    this.mockUsers.set('organizer@example.com', {
      password: 'org123',
      user: {
        id: 'org-user-1',
        email: 'organizer@example.com',
        name: 'Организатор',
        role: 'organizer',
        bio: 'Организую соревнования',
      },
    });
    this.mockUsers.set('admin@example.com', {
      password: 'admin123',
      user: {
        id: 'admin-user-1',
        email: 'admin@example.com',
        name: 'Администратор',
        role: 'admin',
        bio: 'Администратор платформы',
      },
    });
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    const { email, password, role = 'participant' } = request;

    const existing = this.mockUsers.get(email);
    if (existing && existing.password === password) {
      return of({
        user: existing.user,
        token: `mock-jwt-${existing.user.id}`,
      }).pipe(delay(400));
    }

    if (email && password && password.length >= 3) {
      const newUser: User = {
        id: crypto.randomUUID(),
        email,
        name: email.split('@')[0],
        role,
        bio: '',
      };
      return of({
        user: newUser,
        token: `mock-jwt-${newUser.id}`,
      }).pipe(delay(400));
    }

    return throwError(() => new Error('Неверный email или пароль')).pipe(delay(400));
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    const { email, password, name, role = 'participant' } = request;

    if (this.mockUsers.has(email)) {
      return throwError(() => new Error('Пользователь с таким email уже существует')).pipe(
        delay(400),
      );
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name,
      role,
      bio: '',
    };

    this.mockUsers.set(email, { password, user: newUser });

    return of({
      user: newUser,
      token: `mock-jwt-${newUser.id}`,
    }).pipe(delay(500));
  }
}
