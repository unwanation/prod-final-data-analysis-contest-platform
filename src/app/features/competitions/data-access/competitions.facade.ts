import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import type { CompetitionDetails, CompetitionSummary } from '../models';
import { CompetitionsApiService } from './competitions-api.service';

@Injectable({ providedIn: 'root' })
export class CompetitionsFacade {
  private readonly api = inject(CompetitionsApiService);

  readonly competitions = toSignal(this.api.getList(), {
    initialValue: [] as CompetitionSummary[],
  });

  readonly selectedId = signal<string | null>(null);

  readonly selectedDetails = signal<CompetitionDetails | null>(null);

  readonly detailsLoading = signal(false);

  readonly activeCompetitions = computed(() =>
    this.competitions().filter((c) => c.status === 'active'),
  );

  loadDetails(id: string): void {
    this.selectedId.set(id);
    this.detailsLoading.set(true);
    this.api.getById(id).subscribe((details) => {
      this.selectedDetails.set(details);
      this.detailsLoading.set(false);
    });
  }

  clearDetails(): void {
    this.selectedId.set(null);
    this.selectedDetails.set(null);
  }
}
