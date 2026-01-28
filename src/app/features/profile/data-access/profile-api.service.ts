import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

export interface UserStats {
  competitionsCount: number;
  submissionsCount: number;
  bestScore: number | null;
  rank: number | null;
}

export interface UserActivity {
  id: string;
  type: 'submission' | 'registration' | 'achievement';
  title: string;
  description: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileApiService {
  private readonly mockStats: UserStats = {
    competitionsCount: 3,
    submissionsCount: 12,
    bestScore: 87,
    rank: 42,
  };

  private readonly mockActivities: UserActivity[] = [
    {
      id: '1',
      type: 'submission',
      title: 'Решение отправлено',
      description: 'DANO 2026 - Задача 1: Классификация',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      type: 'achievement',
      title: 'Достижение разблокировано',
      description: 'Первые 10 решений',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      type: 'registration',
      title: 'Регистрация на соревнование',
      description: 'Data Challenge: Прогноз продаж',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    },
  ];

  getStats(userId: string): Observable<UserStats> {
    return of(this.mockStats).pipe(delay(200));
  }

  getRecentActivity(userId: string, limit = 5): Observable<UserActivity[]> {
    return of(this.mockActivities.slice(0, limit)).pipe(delay(150));
  }

  updateProfile(
    userId: string,
    data: { name?: string; bio?: string; avatarUrl?: string },
  ): Observable<boolean> {
    console.log('Profile update:', userId, data);
    return of(true).pipe(delay(300));
  }
}
