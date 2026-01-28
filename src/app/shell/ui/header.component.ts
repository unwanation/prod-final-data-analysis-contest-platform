import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TuiButton } from '@taiga-ui/core';
import { TuiAvatar } from '@taiga-ui/kit';
import { AuthFacade } from '../../shared/data-access';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, TuiButton, TuiAvatar],
  template: `
    <header class="header">
      <a routerLink="/" class="logo">NADO</a>

      <nav class="nav" aria-label="Основная навигация">
        <a
          routerLink="/competitions"
          routerLinkActive="active"
          class="nav-link"
        >
          Соревнования
        </a>

        @if (auth.role() === 'organizer' || auth.role() === 'admin') {
          <a
            routerLink="/organizer"
            routerLinkActive="active"
            class="nav-link"
          >
            Организатору
          </a>
        }

        @if (auth.role() === 'admin') {
          <a routerLink="/admin" routerLinkActive="active" class="nav-link">
            Админ
          </a>
        }
      </nav>

      <div class="actions">
        @if (auth.isAuthenticated()) {
          <a routerLink="/profile" class="profile-link" aria-label="Профиль пользователя">
            <tui-avatar
              [src]="auth.user()?.avatarUrl || (auth.user()?.name?.[0]?.toUpperCase() || 'U')"
              size="s"
            />
            <span class="user-name">{{ auth.user()?.name }}</span>
          </a>
          <button tuiButton appearance="flat" size="s" (click)="auth.logout()">
            Выйти
          </button>
        } @else {
          <a tuiButton routerLink="/auth/login" appearance="flat" size="s">
            Войти
          </a>
          <a tuiButton routerLink="/auth/register" appearance="primary" size="s">
            Регистрация
          </a>
        }
      </div>
    </header>
  `,
  styles: `
    .header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1.5rem;
      background: var(--tui-background-base);
      border-bottom: 1px solid var(--tui-border-normal);
    }
    .logo {
      font-weight: 700;
      font-size: 1.25rem;
      text-decoration: none;
      color: var(--tui-text-primary);
    }
    .nav {
      display: flex;
      gap: 1rem;
      margin-left: 2rem;
    }
    .nav-link {
      text-decoration: none;
      color: var(--tui-text-secondary);
      &.active {
        color: var(--tui-text-primary);
        font-weight: 500;
      }
    }
    .actions {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .profile-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: var(--tui-text-primary);
      padding: 0.25rem 0.5rem;
      border-radius: var(--tui-radius-m);
      transition: background 0.2s;
      &:hover {
        background: var(--tui-background-neutral-1);
      }
    }
    .user-name {
      color: var(--tui-text-secondary);
    }
  `,
})
export class HeaderComponent {
  protected readonly auth = inject(AuthFacade);
}
