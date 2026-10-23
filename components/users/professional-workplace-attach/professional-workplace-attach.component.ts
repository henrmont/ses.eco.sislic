import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

// Angular Material
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Core, Services & Models
import { ApiResponse } from '../../../../core/models/api-response.model';
import { MessageService } from '../../../../core/services/message-service';
import { Professional } from '../../../models/professional.model';
import { ProfessionalWorkplace } from '../../../models/professional-workplace.model';
import { Workplace } from '../../../models/workplace.model';
import { UserService } from '../../../services/user.service';
import { WorkplaceService } from '../../../services/workplace.service';

export type ProfessionalWorkplaceAttachDialogData = {
  professional?: Professional;
  currentWorkplaces?: Array<ProfessionalWorkplace | Workplace>;
};

interface ErrorMessage {
  type: string;
  message: string;
}

@Component({
  selector: 'app-professional-workplace-attach',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './professional-workplace-attach.component.html',
  styleUrl: './professional-workplace-attach.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfessionalWorkplaceAttachComponent implements OnInit {
  // Injeção de Dependências
  protected readonly data = inject<ProfessionalWorkplaceAttachDialogData | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly workplaceService = inject(WorkplaceService);
  private readonly messageService = inject(MessageService);
  private readonly dialogRef = inject(MatDialogRef<ProfessionalWorkplaceAttachComponent>);
  private readonly destroyRef = inject(DestroyRef);

  // Estado Reativo
  protected attachForm!: FormGroup;

  private readonly allWorkplaces = signal<Workplace[]>([]);
  protected readonly filteredWorkplaces = signal<Workplace[]>([]);
  protected readonly isLoadingWorkplaces = signal<boolean>(true);
  protected readonly isSubmitting = signal<boolean>(false);

  protected readonly professionalId = computed(() => this.data?.professional?.id ?? null);

  protected readonly errorMessages: Record<string, ErrorMessage[]> = {
    workplace: [
      { type: 'required', message: 'A seleção do local de trabalho é obrigatória.' },
      { type: 'invalidAutocompleteObject', message: 'Selecione um local de trabalho válido da lista.' }
    ]
  };

  constructor() {
    effect(() => {
      const isDisabled = this.isSubmitting() || this.isLoadingWorkplaces();

      if (!this.attachForm) return;

      if (isDisabled) {
        this.attachForm.disable({ emitEvent: false });
      } else {
        this.attachForm.enable({ emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.fetchAndFilterWorkplaces();
    this.setupAutocompleteListener();
  }

  protected displayFn(workplace?: Workplace): string {
    if (!workplace) return '';
    const budgetEntity = workplace.budget_entity ? ` - ${workplace.budget_entity}` : '';
    return `${workplace.name ?? ''}${budgetEntity}`;
  }

  protected onSubmit(): void {
    const professionalId = this.professionalId();
    const selectedWorkplace = this.attachForm.get('workplace')?.value as Workplace;

    if (this.attachForm.invalid || !professionalId || !selectedWorkplace?.id) {
      this.attachForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    this.userService.attachWorkplace(professionalId, selectedWorkplace.id)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ApiResponse) => {
          this.messageService.showMessage(response?.message || 'Local de trabalho vinculado com sucesso!');
          this.dialogRef.close(true);
        },
        error: (err) => {
          const fallbackError = 'Erro ao vincular local de trabalho.';
          this.messageService.showMessage(err?.error?.message || fallbackError);
        }
      });
  }

  private initForm(): void {
    this.attachForm = this.fb.group({
      workplace: [null, [Validators.required, this.autocompleteObjectValidator()]]
    });
  }

  /**
   * Busca a lista geral de locais de trabalho e remove aqueles
   * que já estão vinculados na tabela atual.
   */
  private fetchAndFilterWorkplaces(): void {
    this.isLoadingWorkplaces.set(true);

    const currentList = this.data?.currentWorkplaces ?? [];

    // Mapeia todos os IDs de workplace que já estão vinculados
    const attachedIds = new Set<number>();
    currentList.forEach((item: any) => {
      const wpId = item.workplace_id ?? item.workplace?.id ?? item.id;
      if (wpId) {
        attachedIds.add(Number(wpId));
      }
    });

    this.workplaceService.getWorkplaces()
      .pipe(
        finalize(() => this.isLoadingWorkplaces.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: Workplace[]) => {
          // Filtra mantendo apenas os locais de trabalho cujo ID NÃO está na Set de IDs já vinculados
          const available = (response || []).filter(
            wp => wp.id && !attachedIds.has(Number(wp.id))
          );

          this.allWorkplaces.set(available);
          this.filteredWorkplaces.set(available.slice(0, 10));
        },
        error: (err) => {
          this.allWorkplaces.set([]);
          this.filteredWorkplaces.set([]);
          const fallbackError = 'Não foi possível carregar a lista de locais de trabalho.';
          this.messageService.showMessage(err?.error?.message || fallbackError);
        }
      });
  }

  private setupAutocompleteListener(): void {
    this.attachForm.get('workplace')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        const query = typeof value === 'string' ? value.toLowerCase().trim() : '';
        const all = this.allWorkplaces();

        if (!query) {
          this.filteredWorkplaces.set(all.slice(0, 10));
          return;
        }

        const filtered = all.filter(wp => {
          const nameMatch = wp.name?.toLowerCase().includes(query);
          const entityMatch = wp.budget_entity?.toLowerCase().includes(query);
          return nameMatch || entityMatch;
        });

        this.filteredWorkplaces.set(filtered.slice(0, 10));
      });
  }

  private autocompleteObjectValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value && typeof control.value === 'string') {
        return { invalidAutocompleteObject: true };
      }
      return null;
    };
  }
}