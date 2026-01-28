import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TuiButton, TuiError, TuiLabel, TuiTextfield } from '@taiga-ui/core';
import { TuiFieldErrorPipe } from '@taiga-ui/kit';
import { AuthApiService, AuthFacade } from '../../../../shared/data-access';

@Component({
  selector: 'app-register',
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
  ],
  template: `
    <section class="auth-page">
      <h1>Регистрация</h1>

      <form [formGroup]="form" (ngSubmit)="submit()" class="form">
        <label tuiLabel>
          Имя
          <tui-textfield>
            <input tuiTextfield formControlName="name" />
          </tui-textfield>
          <tui-error [error]="[] | tuiFieldError | async" [formControl]="form.controls.name" />
        </label>

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

        @if (error()) {
          <p class="error" role="alert">{{ error() }}</p>
        }

        <button tuiButton type="submit" appearance="primary" [disabled]="form.invalid || loading()">
          @if (loading()) {
            Регистрация...
          } @else {
            Зарегистрироваться
          }
        </button>
      </form>

      <p class="hint">
        Уже есть аккаунт?
        <a routerLink="/auth/login">Войти</a>
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
    .error {
      color: var(--tui-status-negative);
    }
    .hint {
      margin-top: 1rem;
      text-align: center;
    }
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthFacade);
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected readonly error = signal<string | null>(null);
  protected readonly loading = signal(false);

  protected submit(): void {
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    this.error.set(null);

    const { name, email, password } = this.form.getRawValue();

    this.authApi
      .register({ name, email, password })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.auth.login(response.user.email, password, response.user.role);
          this.loading.set(false);
          this.router.navigate(['/competitions']);
        },
        error: (err: Error) => {
          this.loading.set(false);
          this.error.set(err.message || 'Ошибка регистрации');
        },
      });
  }
}
