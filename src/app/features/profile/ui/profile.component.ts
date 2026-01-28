import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TuiButton, TuiIcon, TuiLabel, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiAvatar } from '@taiga-ui/kit';
import { AuthFacade } from '../../../shared/data-access';
import { ProfileApiService, UserStats } from '../data-access';

@Component({
  selector: 'app-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TuiButton, TuiTextfield, TuiLabel, TuiAvatar, TuiIcon, TuiLoader],
  template: `
    <section class="profile-page">
      <h1>Личный кабинет</h1>

      <div class="profile-header">
        <tui-avatar
          [src]="
            avatarPreview() ||
            auth.user()?.avatarUrl ||
            auth.user()?.name?.[0]?.toUpperCase() || 'U'
          "
          size="xl"
        />
        <div class="user-info">
          <h2>{{ auth.user()?.name }}</h2>
          <p class="email">{{ auth.user()?.email }}</p>
          <span class="role-badge">{{ roleLabel() }}</span>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="save()" class="form">
        <label tuiLabel>
          Имя
          <tui-textfield>
            <input tuiTextfield formControlName="name" />
          </tui-textfield>
        </label>

        <label tuiLabel>
          О себе
          <tui-textfield>
            <textarea tuiTextfield formControlName="bio" rows="3"></textarea>
          </tui-textfield>
        </label>

        <label tuiLabel>
          URL аватара
          <tui-textfield>
            <input tuiTextfield formControlName="avatarUrl" placeholder="https://..." />
          </tui-textfield>
        </label>

        @if (saved()) {
          <p class="success" role="status">
            <tui-icon icon="@tui.check" />
            Изменения сохранены
          </p>
        }

        <div class="actions">
          <button tuiButton type="submit" appearance="primary" [disabled]="saving()">
            @if (saving()) {
              Сохранение...
            } @else {
              Сохранить
            }
          </button>
          <button tuiButton type="button" appearance="flat" (click)="logout()">
            Выйти из аккаунта
          </button>
        </div>
      </form>

      <section class="stats">
        <h3>Статистика</h3>
        @if (statsLoading()) {
          <tui-loader />
        } @else {
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-value">{{ stats()?.competitionsCount ?? 0 }}</span>
              <span class="stat-label">Соревнований</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ stats()?.submissionsCount ?? 0 }}</span>
              <span class="stat-label">Решений</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ stats()?.bestScore ?? '-' }}</span>
              <span class="stat-label">Лучший результат</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ stats()?.rank ? '#' + stats()?.rank : '-' }}</span>
              <span class="stat-label">Рейтинг</span>
            </div>
          </div>
        }
      </section>
    </section>
  `,
  styles: `
    .profile-page {
      max-width: 40rem;
      margin: 0 auto;
    }
    h1 {
      margin-bottom: 1.5rem;
    }
    .profile-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: var(--tui-background-base-alt);
      border-radius: 0.75rem;
    }
    .user-info h2 {
      margin: 0 0 0.25rem;
    }
    .email {
      color: var(--tui-text-secondary);
      margin: 0 0 0.5rem;
    }
    .role-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: var(--tui-background-accent-1);
      color: var(--tui-text-primary);
      border-radius: 1rem;
      font-size: 0.75rem;
      text-transform: uppercase;
    }
    .form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .success {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--tui-status-positive);
    }
    .actions {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
    }
    .stats {
      padding: 1.5rem;
      background: var(--tui-background-base-alt);
      border-radius: 0.75rem;
    }
    .stats h3 {
      margin: 0 0 1rem;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
    @media (min-width: 480px) {
      .stats-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }
    .stat-card {
      text-align: center;
      padding: 1rem;
      background: var(--tui-background-base);
      border-radius: 0.5rem;
    }
    .stat-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--tui-text-primary);
    }
    .stat-label {
      font-size: 0.875rem;
      color: var(--tui-text-secondary);
    }
    tui-loader {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }
  `,
})
export class ProfileComponent implements OnInit {
  protected readonly auth = inject(AuthFacade);
  protected readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly profileApi = inject(ProfileApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    bio: [''],
    avatarUrl: [''],
  });

  protected readonly saved = signal(false);
  protected readonly saving = signal(false);
  protected readonly avatarPreview = signal<string | null>(null);
  protected readonly stats = signal<UserStats | null>(null);
  protected readonly statsLoading = signal(true);

  ngOnInit(): void {
    const user = this.auth.user();
    if (user) {
      this.form.patchValue({
        name: user.name,
        bio: user.bio ?? '',
        avatarUrl: user.avatarUrl ?? '',
      });
    }

    this.form.controls.avatarUrl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((url) => {
        this.avatarPreview.set(url || null);
      });

    this.loadStats();
  }

  private loadStats(): void {
    const userId = this.auth.user()?.id;
    if (!userId) {
      this.statsLoading.set(false);
      return;
    }

    this.profileApi
      .getStats(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (stats) => {
          this.stats.set(stats);
          this.statsLoading.set(false);
        },
        error: () => {
          this.statsLoading.set(false);
        },
      });
  }

  protected roleLabel(): string {
    switch (this.auth.role()) {
      case 'admin':
        return 'Администратор';
      case 'organizer':
        return 'Организатор';
      default:
        return 'Участник';
    }
  }

  protected save(): void {
    if (this.form.invalid || this.saving()) return;

    const userId = this.auth.user()?.id;
    if (!userId) return;

    this.saving.set(true);
    const { name, bio, avatarUrl } = this.form.getRawValue();

    this.profileApi
      .updateProfile(userId, { name, bio, avatarUrl: avatarUrl || undefined })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.auth.updateProfile({ name, bio, avatarUrl: avatarUrl || undefined });
          this.saving.set(false);
          this.saved.set(true);
          setTimeout(() => this.saved.set(false), 3000);
        },
        error: () => {
          this.saving.set(false);
        },
      });
  }

  protected logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
