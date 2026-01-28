import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TuiButton, TuiError, TuiLabel, TuiTextfield } from '@taiga-ui/core';
import { TuiFieldErrorPipe, TuiSegmented } from '@taiga-ui/kit';
import { AuthApiService, AuthFacade } from '../../../../shared/data-access';
import type { UserRole } from '../../../../shared/models';

const ROLE_LABELS: Record<UserRole, string> = {
  participant: 'Участник',
  organizer: 'Организатор',
  admin: 'Администратор',
};

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    RouterLink,
    TuiButton,
    TuiTextfield,
    TuiLabel,
    TuiError,
    TuiFieldErrorPipe,
    TuiSegmented,
  ],
  template: `
    <section class="auth-page">
      <h1>Вход</h1>

      <form [formGroup]="form" (ngSubmit)="submit()" class="form">
        <label tuiLabel>
          Email
          <tui-textfield>
            <input tuiTextfield formControlName="email" type="email" />
          </tui-textfield>
          <tui-error [error]="[] | tuiFieldError | async" [formControl]="form.controls.email" />
        </label>

        <label tuiLabel>
          Пароль
          <tui-textfield>
            <input tuiTextfield formControlName="password" type="password" />
          </tui-textfield>
          <tui-error [error]="[] | tuiFieldError | async" [formControl]="form.controls.password" />
        </label>

        <fieldset class="role-group">
          <legend>Войти как:</legend>
          <tui-segmented
            [activeItemIndex]="selectedRoleIndex()"
            (activeItemIndexChange)="onRoleChange($event)"
          >
            @for (role of roles; track role) {
              <button type="button">{{ roleLabels[role] }}</button>
            }
          </tui-segmented>
        </fieldset>

        @if (error()) {
          <p class="error" role="alert">{{ error() }}</p>
        }

        <button tuiButton type="submit" appearance="primary" [disabled]="form.invalid || loading()">
          @if (loading()) {
            Вход...
          } @else {
            Войти
          }
        </button>
      </form>

      <p class="hint">
        Нет аккаунта?
        <a routerLink="/auth/register">Зарегистрироваться</a>
      </p>
    </section>
  `,
  styles: `
    .auth-page {
      max-width: 24rem;
      margin: 2rem auto;
    }
    h1 {
      margin-bottom: 1.5rem;
    }
    .form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .role-group {
      border: none;
      padding: 0;
      margin: 0;
    }
    .role-group legend {
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    .error {
      color: var(--tui-status-negative);
    }
    .hint {
      margin-top: 1rem;
      text-align: center;
    }
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthFacade);
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly roles: UserRole[] = ['participant', 'organizer', 'admin'];
  protected readonly roleLabels = ROLE_LABELS;
  protected readonly selectedRoleIndex = signal(0);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected readonly error = signal<string | null>(null);
  protected readonly loading = signal(false);

  protected onRoleChange(index: number): void {
    this.selectedRoleIndex.set(index);
  }

  protected submit(): void {
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    this.error.set(null);

    const { email, password } = this.form.getRawValue();
    const role = this.roles[this.selectedRoleIndex()];

    this.authApi
      .login({ email, password, role })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.auth.login(response.user.email, password, response.user.role);
          this.loading.set(false);

          switch (response.user.role) {
            case 'admin':
              this.router.navigate(['/admin']);
              break;
            case 'organizer':
              this.router.navigate(['/organizer']);
              break;
            default:
              this.router.navigate(['/competitions']);
          }
        },
        error: (err: Error) => {
          this.loading.set(false);
          this.error.set(err.message || 'Ошибка авторизации');
        },
      });
  }
}
