import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  OnDestroy,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TuiButton, TuiLoader } from '@taiga-ui/core';
import { TuiBadge, TuiTabs } from '@taiga-ui/kit';
import { CompetitionsFacade } from '../../data-access';
import { CompetitionsApiService } from '../../data-access/competitions-api.service';
import { AuthFacade } from '../../../../shared/data-access';
import type { CompetitionTask, Submission } from '../../models';

@Component({
  selector: 'app-competition-participate',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    TuiButton,
    TuiLoader,
    TuiBadge,
    TuiTabs,
  ],
  template: `
    @if (facade.detailsLoading()) {
      <tui-loader class="loader" />
    } @else if (facade.selectedDetails(); as comp) {
      <article class="participate-page">
        <a [routerLink]="['/competitions', comp.id]" class="back">
          ← Назад к описанию
        </a>

        <header class="header">
          <h1>{{ comp.title }}</h1>
          <tui-badge>{{ comp.status === 'active' ? 'Активно' : 'Завершено' }}</tui-badge>
        </header>

        <p class="deadline">
          Дедлайн: {{ comp.deadlineAt | date: 'dd.MM.yyyy HH:mm' }}
        </p>

        @if (comp.tasks.length > 1) {
          <nav tuiTabs class="tabs">
            @for (task of comp.tasks; track task.id; let i = $index) {
              <button
                tuiTab
                [class.active]="selectedTaskIndex() === i"
                (click)="selectTask(i)"
              >
                Задача {{ i + 1 }}
              </button>
            }
          </nav>
        }

        @if (currentTask(); as task) {
          <section class="task-section">
            <h2>{{ task.title }}</h2>
            <p class="task-description">{{ task.description }}</p>

            <div class="submission-info">
              <span>Тип ответа: <strong>{{ submissionTypeLabel(task.submissionType) }}</strong></span>
              <span>Осталось попыток: <strong>{{ task.maxAttempts }}</strong></span>
            </div>

            <form [formGroup]="form" (ngSubmit)="submit(task)" class="submission-form">
              @switch (task.submissionType) {
                @case ('text') {
                  <label class="form-label">
                    Ваш ответ
                    <textarea
                      formControlName="answer"
                      class="answer-input"
                      rows="4"
                      placeholder="Введите ответ..."
                    ></textarea>
                  </label>
                }
                @case ('code') {
                  <label class="form-label">
                    Ваш код
                    <textarea
                      formControlName="answer"
                      class="answer-input code-input"
                      rows="12"
                      placeholder="# Напишите код здесь..."
                    ></textarea>
                  </label>
                }
                @case ('file') {
                  <label class="form-label">
                    Ссылка на файл или вставьте содержимое
                    <textarea
                      formControlName="answer"
                      class="answer-input"
                      rows="6"
                      placeholder="Вставьте CSV данные или укажите ссылку..."
                    ></textarea>
                  </label>
                }
              }

              <div class="form-actions">
                <button
                  tuiButton
                  type="submit"
                  appearance="primary"
                  [disabled]="form.invalid || submitting()"
                >
                  @if (submitting()) {
                    Отправка...
                  } @else {
                    Отправить решение
                  }
                </button>
              </div>
            </form>

            @if (lastSubmission(); as sub) {
              <div class="result-card" [class.success]="sub.status === 'evaluated'">
                <h3>Результат</h3>
                <p>Статус: <strong>{{ sub.status === 'evaluated' ? 'Оценено' : 'Ожидает' }}</strong></p>
                @if (sub.score !== undefined) {
                  <p class="score">Балл: <strong>{{ sub.score }}</strong> / 100</p>
                }
                <p class="submitted-at">
                  Отправлено: {{ sub.submittedAt | date: 'dd.MM.yyyy HH:mm:ss' }}
                </p>
              </div>
            }
          </section>
        }
      </article>
    } @else {
      <p>Соревнование не найдено.</p>
      <a routerLink="/competitions">← К списку</a>
    }
  `,
  styles: `
    .participate-page {
      max-width: 50rem;
      margin: 0 auto;
    }
    .loader {
      margin: 2rem auto;
    }
    .back {
      display: inline-block;
      margin-bottom: 1rem;
      color: var(--tui-text-secondary);
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
    .header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }
    h1 {
      margin: 0;
    }
    .deadline {
      color: var(--tui-text-secondary);
      margin-bottom: 1.5rem;
    }
    .tabs {
      margin-bottom: 1.5rem;
    }
    .task-section {
      padding: 1.5rem;
      background: var(--tui-background-base-alt);
      border-radius: 0.75rem;
    }
    h2 {
      margin: 0 0 0.75rem;
    }
    .task-description {
      margin-bottom: 1rem;
      line-height: 1.6;
    }
    .submission-info {
      display: flex;
      gap: 2rem;
      margin-bottom: 1.5rem;
      padding: 0.75rem 1rem;
      background: var(--tui-background-base);
      border-radius: 0.5rem;
      font-size: 0.875rem;
    }
    .submission-form {
      margin-bottom: 1.5rem;
    }
    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    .answer-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--tui-border-normal);
      border-radius: 0.5rem;
      font-family: inherit;
      font-size: 1rem;
      resize: vertical;
      background: var(--tui-background-base);
      color: var(--tui-text-primary);
      &:focus {
        outline: 2px solid var(--tui-border-focus);
        outline-offset: 2px;
      }
    }
    .code-input {
      font-family: 'Fira Code', 'Consolas', monospace;
      font-size: 0.875rem;
    }
    .form-actions {
      margin-top: 1rem;
    }
    .result-card {
      padding: 1rem;
      background: var(--tui-background-base);
      border: 2px solid var(--tui-border-normal);
      border-radius: 0.5rem;
      &.success {
        border-color: var(--tui-status-positive);
      }
    }
    .result-card h3 {
      margin: 0 0 0.5rem;
    }
    .score {
      font-size: 1.25rem;
    }
    .submitted-at {
      color: var(--tui-text-secondary);
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }
  `,
})
export class CompetitionParticipateComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CompetitionsApiService);
  private readonly auth = inject(AuthFacade);
  protected readonly facade = inject(CompetitionsFacade);

  protected readonly selectedTaskIndex = signal(0);
  protected readonly submitting = signal(false);
  protected readonly lastSubmission = signal<Submission | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    answer: ['', Validators.required],
  });

  protected readonly currentTask = computed<CompetitionTask | null>(() => {
    const details = this.facade.selectedDetails();
    if (!details?.tasks?.length) return null;
    return details.tasks[this.selectedTaskIndex()] ?? null;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.facade.loadDetails(id);
    }
  }

  ngOnDestroy(): void {
    this.facade.clearDetails();
  }

  protected selectTask(index: number): void {
    this.selectedTaskIndex.set(index);
    this.form.reset();
    this.lastSubmission.set(null);
  }

  protected submissionTypeLabel(type: string): string {
    switch (type) {
      case 'text':
        return 'Текстовый ответ';
      case 'code':
        return 'Код';
      case 'file':
        return 'Файл / CSV';
      default:
        return type;
    }
  }

  protected submit(task: CompetitionTask): void {
    if (this.form.invalid) return;

    const userId = this.auth.user()?.id;
    if (!userId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.submitting.set(true);
    const { answer } = this.form.getRawValue();

    this.api.submitAnswer(task.id, userId, answer).subscribe({
      next: (submission) => {
        this.lastSubmission.set(submission);
        this.submitting.set(false);
      },
      error: () => {
        this.submitting.set(false);
      },
    });
  }
}
