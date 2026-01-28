import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TuiButton, TuiLoader } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { CompetitionsFacade } from '../../data-access';
import type { CompetitionStatus } from '../../models';

@Component({
  selector: 'app-competition-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, TuiButton, TuiLoader, TuiBadge],
  template: `
    @if (facade.detailsLoading()) {
      <tui-loader class="loader" />
    } @else if (facade.selectedDetails(); as comp) {
      <article>
        <a routerLink="/competitions" class="back">← Назад к списку</a>

        <header class="header">
          <h1>{{ comp.title }}</h1>
          <tui-badge>{{ statusLabel(comp.status) }}</tui-badge>
        </header>

        <p class="dates">
          {{ comp.startAt | date: 'dd.MM.yyyy' }} —
          {{ comp.deadlineAt | date: 'dd.MM.yyyy' }}
        </p>

        <section class="section">
          <h2>Описание</h2>
          <p>{{ comp.description }}</p>
        </section>

        <section class="section">
          <h2>Правила</h2>
          <p>{{ comp.rules }}</p>
        </section>

        @if (comp.tasks.length) {
          <section class="section">
            <h2>Задачи ({{ comp.tasks.length }})</h2>
            <ul class="tasks-list">
              @for (task of comp.tasks; track task.id) {
                <li>{{ task.title }}</li>
              }
            </ul>
          </section>
        }

        @if (comp.status === 'active') {
          <a
            tuiButton
            [routerLink]="['/competitions', comp.id, 'participate']"
            appearance="primary"
          >
            Участвовать
          </a>
        } @else if (comp.status === 'upcoming') {
          <button tuiButton appearance="secondary" disabled>Соревнование ещё не началось</button>
        } @else {
          <button tuiButton appearance="flat" disabled>Соревнование завершено</button>
        }
      </article>
    } @else {
      <p>Соревнование не найдено.</p>
      <a routerLink="/competitions">← К списку</a>
    }
  `,
  styles: `
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
    .dates {
      color: var(--tui-text-secondary);
      margin-bottom: 1.5rem;
    }
    .section {
      margin-bottom: 1.5rem;
    }
    h2 {
      font-size: 1.125rem;
      margin-bottom: 0.5rem;
    }
    .tasks-list {
      margin: 0;
      padding-left: 1.25rem;
      li {
        margin-bottom: 0.25rem;
      }
    }
  `,
})
export class CompetitionDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  protected readonly facade = inject(CompetitionsFacade);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.facade.loadDetails(id);
    }
  }

  ngOnDestroy(): void {
    this.facade.clearDetails();
  }

  protected statusLabel(status: CompetitionStatus): string {
    switch (status) {
      case 'active':
        return 'Активно';
      case 'upcoming':
        return 'Скоро';
      case 'finished':
        return 'Завершено';
    }
  }
}
