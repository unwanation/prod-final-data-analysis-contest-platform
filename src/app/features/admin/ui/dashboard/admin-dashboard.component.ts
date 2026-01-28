import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { TuiAvatar, TuiBadge, TuiBadgedContent } from '@taiga-ui/kit';

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'participant' | 'organizer' | 'admin';
  status: 'active' | 'banned';
  createdAt: Date;
}

const MOCK_USERS: MockUser[] = [
  { id: '1', name: 'Иван Петров', email: 'ivan@example.com', role: 'participant', status: 'active', createdAt: new Date('2024-01-15') },
  { id: '2', name: 'Мария Сидорова', email: 'maria@example.com', role: 'organizer', status: 'active', createdAt: new Date('2024-02-20') },
  { id: '3', name: 'Алексей Иванов', email: 'alex@example.com', role: 'participant', status: 'banned', createdAt: new Date('2024-03-01') },
  { id: '4', name: 'Елена Козлова', email: 'elena@example.com', role: 'admin', status: 'active', createdAt: new Date('2024-01-01') },
  { id: '5', name: 'Дмитрий Волков', email: 'dmitry@example.com', role: 'participant', status: 'active', createdAt: new Date('2024-03-15') },
];

@Component({
  selector: 'app-admin-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiButton, TuiIcon, TuiAvatar, TuiBadge, TuiBadgedContent],
  template: `
    <section class="dashboard">
      <h1>Панель администратора</h1>

      <div class="stats">
        <div class="stat-card">
          <span class="stat-value">{{ stats().users }}</span>
          <span class="stat-label">Пользователей</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats().competitions }}</span>
          <span class="stat-label">Соревнований</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats().submissions }}</span>
          <span class="stat-label">Решений</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats().activeNow }}</span>
          <span class="stat-label">Активных сейчас</span>
        </div>
      </div>

      <section class="section">
        <h2>Управление пользователями</h2>
        <div class="users-table">
          <div class="table-header">
            <span>Пользователь</span>
            <span>Email</span>
            <span>Роль</span>
            <span>Статус</span>
            <span>Действия</span>
          </div>
          @for (user of users(); track user.id) {
            <div class="table-row">
              <span class="user-cell">
                <tui-avatar [src]="user.name[0].toUpperCase()" size="s" />
                {{ user.name }}
              </span>
              <span>{{ user.email }}</span>
              <span>
                <tui-badge
                  [appearance]="getRoleAppearance(user.role)"
                  size="s"
                >{{ getRoleLabel(user.role) }}</tui-badge>
              </span>
              <span>
                <tui-badge
                  [appearance]="user.status === 'active' ? 'success' : 'error'"
                  size="s"
                >{{ user.status === 'active' ? 'Активен' : 'Заблокирован' }}</tui-badge>
              </span>
              <span class="actions-cell">
                @if (user.status === 'active') {
                  <button
                    tuiButton
                    appearance="flat"
                    size="s"
                    (click)="toggleUserStatus(user)"
                  >
                    Заблокировать
                  </button>
                } @else {
                  <button
                    tuiButton
                    appearance="flat"
                    size="s"
                    (click)="toggleUserStatus(user)"
                  >
                    Разблокировать
                  </button>
                }
                <button tuiButton appearance="flat" size="s">
                  <tui-icon icon="@tui.settings" />
                </button>
              </span>
            </div>
          }
        </div>
      </section>

      <section class="section">
        <h2>Модерация соревнований</h2>
        <p class="text-secondary">Здесь будет список соревнований на модерацию.</p>
        <div class="placeholder">
          <p>Нет соревнований, ожидающих модерации</p>
        </div>
      </section>
    </section>
  `,
  styles: `
    .dashboard {
      max-width: 64rem;
      margin: 0 auto;
    }
    h1 {
      margin-bottom: 1.5rem;
    }
    h2 {
      margin-bottom: 1rem;
      font-size: 1.25rem;
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
    .users-table {
      border: 1px solid var(--tui-border-normal);
      border-radius: var(--tui-radius-m);
      overflow: hidden;
    }
    .table-header {
      display: grid;
      grid-template-columns: 1.5fr 1.5fr 1fr 1fr 1.5fr;
      gap: 1rem;
      padding: 0.75rem 1rem;
      background: var(--tui-background-neutral-1);
      font-weight: 500;
      font-size: 0.875rem;
      color: var(--tui-text-secondary);
    }
    .table-row {
      display: grid;
      grid-template-columns: 1.5fr 1.5fr 1fr 1fr 1.5fr;
      gap: 1rem;
      padding: 0.75rem 1rem;
      align-items: center;
      border-top: 1px solid var(--tui-border-normal);
    }
    .user-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .actions-cell {
      display: flex;
      gap: 0.25rem;
    }
    .text-secondary {
      color: var(--tui-text-secondary);
      margin-bottom: 1rem;
    }
    .placeholder {
      padding: 2rem;
      border: 2px dashed var(--tui-border-normal);
      border-radius: 0.5rem;
      text-align: center;
      color: var(--tui-text-secondary);
    }
  `,
})
export class AdminDashboardComponent {
  protected readonly users = signal<MockUser[]>(MOCK_USERS);

  protected readonly stats = signal({
    users: 156,
    competitions: 12,
    submissions: 1423,
    activeNow: 23,
  });

  protected getRoleLabel(role: MockUser['role']): string {
    const labels = { participant: 'Участник', organizer: 'Организатор', admin: 'Админ' };
    return labels[role];
  }

  protected getRoleAppearance(role: MockUser['role']): string {
    const appearances = { participant: 'neutral', organizer: 'info', admin: 'warning' };
    return appearances[role];
  }

  protected toggleUserStatus(user: MockUser): void {
    this.users.update((users) =>
      users.map((u) =>
        u.id === user.id ? { ...u, status: u.status === 'active' ? 'banned' : 'active' } : u
      )
    );
  }
}
