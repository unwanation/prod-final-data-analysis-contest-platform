import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import type { CompetitionDetails, CompetitionSummary, Submission } from '../models';

const MOCK_COMPETITIONS: CompetitionDetails[] = [
  {
    id: '1',
    title: 'DANO 2025 — Отборочный этап',
    status: 'active',
    startAt: '2025-11-15T00:00:00Z',
    deadlineAt: '2025-12-15T23:59:59Z',
    description: 'Первый отборочный этап Национальной олимпиады по анализу данных DANO.',
    rules: 'Решения принимаются в формате .csv. Максимум 5 попыток в день.',
    tasks: [
      {
        id: 't1',
        title: 'Задача 1: Классификация',
        description:
          'Классифицируйте данные из train.csv и загрузите predictions.csv с предсказаниями.',
        submissionType: 'file',
        maxAttempts: 5,
      },
      {
        id: 't2',
        title: 'Задача 2: Теоретический вопрос',
        description:
          'Какой метрикой лучше оценивать модель при несбалансированных классах? Напишите ответ.',
        submissionType: 'text',
        maxAttempts: 3,
      },
    ],
  },
  {
    id: '2',
    title: 'Data Challenge: Прогноз продаж',
    status: 'upcoming',
    startAt: '2026-03-01T00:00:00Z',
    deadlineAt: '2026-03-31T23:59:59Z',
    description: 'Соревнование по прогнозированию продаж на основе исторических данных.',
    rules: 'Формат решения — CSV с предсказаниями. Оценка по RMSE.',
    tasks: [
      {
        id: 't3',
        title: 'Прогноз продаж',
        description: 'Предскажите продажи на следующий месяц. Загрузите CSV файл.',
        submissionType: 'file',
        maxAttempts: 10,
      },
    ],
  },
  {
    id: '3',
    title: 'Hackathon: Визуализация',
    status: 'finished',
    startAt: '2024-11-01T00:00:00Z',
    deadlineAt: '2024-11-15T23:59:59Z',
    description: 'Конкурс на лучшую визуализацию открытых данных.',
    rules: 'Презентация + исходный код.',
    tasks: [
      {
        id: 't4',
        title: 'Код визуализации',
        description: 'Напишите Python код для визуализации данных.',
        submissionType: 'code',
        maxAttempts: 1,
      },
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class CompetitionsApiService {
  getList(): Observable<CompetitionSummary[]> {
    const list: CompetitionSummary[] = MOCK_COMPETITIONS.map(
      ({ id, title, status, startAt, deadlineAt }) => ({
        id,
        title,
        status,
        startAt,
        deadlineAt,
      }),
    );
    return of(list).pipe(delay(300));
  }

  getById(id: string): Observable<CompetitionDetails | null> {
    const found = MOCK_COMPETITIONS.find((c) => c.id === id) ?? null;
    return of(found).pipe(delay(200));
  }

  submitAnswer(taskId: string, userId: string, answer: string): Observable<Submission> {
    const submission: Submission = {
      id: crypto.randomUUID(),
      taskId,
      userId,
      answer,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };
    return of({
      ...submission,
      status: 'evaluated' as const,
      score: Math.round(Math.random() * 100),
    }).pipe(delay(1500));
  }
}
