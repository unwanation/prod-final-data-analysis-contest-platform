import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiLoader } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { CompetitionsFacade } from '../../data-access';
import type { CompetitionStatus } from '../../models';

@Component({
  selector: 'app-competitions-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, TuiLoader, TuiBadge],
  template: `
    <section>
      <h1>Соревнования</h1>

      @if (facade.competitions().length === 0) {
        <tui-loader />
      } @else {
        <ul class="list">
          @for (comp of facade.competitions(); track comp.id) {
            <li class="card">
              <div class="card-header">
                <a [routerLink]="['/competitions', comp.id]" class="title">
                  {{ comp.title }}
                </a>
                <tui-badge [attr.data-status]="comp.status">
                  {{ statusLabel(comp.status) }}
                </tui-badge>
              </div>
              <p class="dates">
                {{ comp.startAt | date: 'dd.MM.yyyy' }} —
                {{ comp.deadlineAt | date: 'dd.MM.yyyy' }}
              </p>
            </li>
          }
        </ul>
      }
    </section>
  `,
  styles: `
    h1 {
      margin-bottom: 1rem;
    }
    .list {
      list-style: none;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .card {
      padding: 1rem;
      border: 1px solid var(--tui-border-normal);
      border-radius: 0.5rem;
    }
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }
    .title {
      font-weight: 500;
      text-decoration: none;
      color: var(--tui-text-primary);
      &:hover {
        text-decoration: underline;
      }
    }
    .dates {
      margin-top: 0.5rem;
      color: var(--tui-text-secondary);
      font-size: 0.875rem;
    }
  `,
})
export class CompetitionsListComponent {
  protected readonly facade = inject(CompetitionsFacade);

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
