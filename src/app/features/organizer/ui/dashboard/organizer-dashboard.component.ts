import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiIcon, TuiLabel, TuiTextfield } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { AuthFacade } from '../../../../shared/data-access';

type CompetitionStatus = 'upcoming' | 'active' | 'finished';

interface OrganizerCompetition {
  id: string;
  title: string;
  description: string;
  rules: string;
  status: CompetitionStatus;
  startDate: Date;
  endDate: Date;
  participantsCount: number;
  submissionsCount: number;
}

@Component({
  selector: 'app-organizer-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DatePipe, TuiButton, TuiTextfield, TuiLabel, TuiIcon, TuiBadge],
  template: `
    <section class="dashboard">
      <h1>Панель организатора</h1>

      <div class="stats">
        <div class="stat-card">
          <span class="stat-value">{{ myCompetitions().length }}</span>
          <span class="stat-label">Моих соревнований</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ totalParticipants() }}</span>
          <span class="stat-label">Участников</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ totalSubmissions() }}</span>
          <span class="stat-label">Решений</span>
        </div>
      </div>

      <section class="section">
        <div class="section-header">
          <h2>Мои соревнования</h2>
          <button tuiButton appearance="primary" size="s" (click)="showCreateForm.set(true)">
            <tui-icon icon="@tui.plus" />
            Создать
          </button>
        </div>

        @if (showCreateForm()) {
          <div class="create-form">
            <h3>Новое соревнование</h3>
            <form [formGroup]="form" (ngSubmit)="createCompetition()" class="form">
              <label tuiLabel>
                Название
                <tui-textfield>
                  <input tuiTextfield formControlName="title" />
                </tui-textfield>
              </label>

              <label tuiLabel>
                Краткое описание
                <tui-textfield>
                  <textarea tuiTextfield formControlName="description" rows="3"></textarea>
                </tui-textfield>
              </label>

              <label tuiLabel>
                Правила
                <tui-textfield>
                  <textarea tuiTextfield formControlName="rules" rows="3"></textarea>
                </tui-textfield>
              </label>

              <div class="form-actions">
                <button
                  tuiButton
                  type="button"
                  appearance="flat"
                  (click)="showCreateForm.set(false)"
                >
                  Отмена
                </button>
                <button tuiButton type="submit" appearance="primary" [disabled]="form.invalid">
                  Создать соревнование
                </button>
              </div>
            </form>
          </div>
        }

        @if (myCompetitions().length === 0) {
          <div class="placeholder">
            <p>У вас пока нет соревнований</p>
            <button tuiButton appearance="outline" (click)="showCreateForm.set(true)">
              Создать первое соревнование
            </button>
          </div>
        } @else {
          <div class="competitions-list">
            @for (comp of myCompetitions(); track comp.id) {
              <article class="competition-card">
                <div class="card-header">
                  <h3>{{ comp.title }}</h3>
                  <tui-badge [appearance]="getStatusAppearance(comp.status)" size="s">{{
                    getStatusLabel(comp.status)
                  }}</tui-badge>
                </div>
                <p class="description">{{ comp.description }}</p>
                <div class="card-stats">
                  <span
                    ><tui-icon icon="@tui.users" /> {{ comp.participantsCount }} участников</span
                  >
                  <span
                    ><tui-icon icon="@tui.file-text" /> {{ comp.submissionsCount }} решений</span
                  >
                </div>
                <div class="card-dates">
                  {{ comp.startDate | date: 'd MMM' }} — {{ comp.endDate | date: 'd MMM yyyy' }}
                </div>
                <div class="card-actions">
                  <button tuiButton appearance="flat" size="s">
                    <tui-icon icon="@tui.pencil" />
                    Редактировать
                  </button>
                  <button tuiButton appearance="flat" size="s">Решения</button>
                </div>
              </article>
            }
          </div>
        }
      </section>
    </section>
  `,
  styles: `
    .dashboard {
      max-width: 56rem;
      margin: 0 auto;
    }
    h1 {
      margin-bottom: 1.5rem;
    }
    h2 {
      margin: 0;
      font-size: 1.25rem;
    }
    h3 {
      margin: 0;
      font-size: 1.125rem;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: var(--tui-background-base);
      border: 1px solid var(--tui-border-normal);
      border-radius: var(--tui-radius-l);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--tui-text-primary);
    }
    .stat-label {
      font-size: 0.875rem;
      color: var(--tui-text-secondary);
      margin-top: 0.25rem;
    }
    .section {
      margin-bottom: 2rem;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .create-form {
      background: var(--tui-background-base);
      border: 1px solid var(--tui-border-normal);
      border-radius: var(--tui-radius-l);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .create-form h3 {
      margin-bottom: 1rem;
    }
    .form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    .competitions-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .competition-card {
      background: var(--tui-background-base);
      border: 1px solid var(--tui-border-normal);
      border-radius: var(--tui-radius-l);
      padding: 1.25rem;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }
    .description {
      color: var(--tui-text-secondary);
      margin-bottom: 0.75rem;
      line-height: 1.5;
    }
    .card-stats {
      display: flex;
      gap: 1.5rem;
      color: var(--tui-text-secondary);
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }
    .card-dates {
      color: var(--tui-text-secondary);
      font-size: 0.875rem;
      margin-bottom: 0.75rem;
    }
    .card-actions {
      display: flex;
      gap: 0.5rem;
    }
    .placeholder {
      padding: 2rem;
      border: 2px dashed var(--tui-border-normal);
      border-radius: 0.5rem;
      text-align: center;
      color: var(--tui-text-secondary);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
  `,
})
export class OrganizerDashboardComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthFacade);

  protected readonly showCreateForm = signal(false);

  protected readonly myCompetitions = signal<OrganizerCompetition[]>([
    {
      id: 'my-1',
      title: 'Прогнозирование продаж',
      description: 'Постройте модель прогнозирования продаж на основе исторических данных.',
      rules: 'Используйте только предоставленные данные.',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-02-15'),
      status: 'active',
      participantsCount: 45,
      submissionsCount: 128,
    },
    {
      id: 'my-2',
      title: 'Классификация изображений',
      description: 'Разработайте алгоритм классификации изображений товаров.',
      rules: 'Метрика: F1-score. Минимальный порог: 0.85.',
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-04-01'),
      status: 'upcoming',
      participantsCount: 12,
      submissionsCount: 0,
    },
  ]);

  protected readonly totalParticipants = computed(() =>
    this.myCompetitions().reduce((sum, c) => sum + c.participantsCount, 0),
  );

  protected readonly totalSubmissions = computed(() =>
    this.myCompetitions().reduce((sum, c) => sum + c.submissionsCount, 0),
  );

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.minLength(20)]],
    rules: ['', Validators.required],
  });

  protected getStatusLabel(status: CompetitionStatus): string {
    const labels = { active: 'Активно', upcoming: 'Скоро', finished: 'Завершено' };
    return labels[status];
  }

  protected getStatusAppearance(status: CompetitionStatus): string {
    const appearances = { active: 'success', upcoming: 'info', finished: 'neutral' };
    return appearances[status];
  }

  protected createCompetition(): void {
    if (this.form.invalid) return;

    const { title, description, rules } = this.form.getRawValue();
    const newComp: OrganizerCompetition = {
      id: crypto.randomUUID(),
      title,
      description,
      rules,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'upcoming',
      participantsCount: 0,
      submissionsCount: 0,
    };

    this.myCompetitions.update((comps) => [newComp, ...comps]);
    this.form.reset();
    this.showCreateForm.set(false);
  }
}
