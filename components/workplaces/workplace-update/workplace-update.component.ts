import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { NgxMaskDirective } from 'ngx-mask';

// Angular Material
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Core & Models
import { MessageService } from '../../../../core/services/message-service';
import { Workplace } from '../../../models/workplace.model';

// Services
import { WorkplaceService } from '../../../services/workplace.service';
import { CommonModule } from '@angular/common';

type WorkplaceUpdateDialogData = {
  workplace?: Workplace;
};

interface ErrorMessage {
  type: string;
  message: string;
}

@Component({
  selector: 'app-workplace-update',
  standalone: true,
  imports: [
    MatAutocompleteModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    NgxMaskDirective,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './workplace-update.component.html',
  styleUrl: './workplace-update.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkplaceUpdateComponent implements OnInit {
  // ==========================================
  // Injeção de Dependências
  // ==========================================
  protected readonly data = inject<WorkplaceUpdateDialogData | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly workplaceService = inject(WorkplaceService);
  private readonly messageService = inject(MessageService);
  private readonly dialogRef = inject(MatDialogRef<WorkplaceUpdateComponent>);
  private readonly destroyRef = inject(DestroyRef);

  // ==========================================
  // Propriedades e Estado Reativo
  // ==========================================
  protected workplaceForm!: FormGroup;
  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly isLoadingWorkplaces = signal<boolean>(false);

  protected allWorkplaces: Workplace[] = [];
  protected filteredWorkplaces$!: Observable<Workplace[]>;

  protected readonly errorMessages: Record<string, ErrorMessage[]> = {
    budget_entity: [
      { type: 'required', message: 'A unidade orçamentária é obrigatória.' }
    ],
    name: [
      { type: 'required', message: 'O nome do local de trabalho é obrigatório.' }
    ]
  };

  // ==========================================
  // Ciclo de Vida (Hooks)
  // ==========================================
  ngOnInit(): void {
    this.initForm();
    this.loadWorkplaces();
  }

  // ==========================================
  // Métodos Acessíveis pelo Template (Protected)
  // ==========================================
  protected displayWorkplaceFn(workplace: Workplace): string {
    return workplace?.name || '';
  }

  protected onSubmit(): void {
    const workplaceId = this.data?.workplace?.id;

    if (!workplaceId) {
      this.messageService.showMessage('Identificador do local de trabalho inválido.');
      return;
    }

    if (this.workplaceForm.invalid) {
      this.workplaceForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.workplaceForm.disable({ emitEvent: false });

    const formValue = this.workplaceForm.getRawValue();
    const payload: Workplace = {
      budget_entity: formValue.budget_entity,
      name: formValue.name,
      parent_id: formValue.parent?.id || null
    };

    this.workplaceService.updateWorkplace(workplaceId, payload)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.workplaceForm.enable({ emitEvent: false });
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.messageService.showMessage('Local de trabalho atualizado com sucesso!');
          this.dialogRef.close(true);
        },
        error: (err) => {
          const fallbackError = 'Erro ao atualizar o local de trabalho.';
          this.messageService.showMessage(err?.error?.message || fallbackError);
        }
      });
  }

  // ==========================================
  // Métodos Privados
  // ==========================================
  private initForm(): void {
    const workplace = this.data?.workplace;

    this.workplaceForm = this.fb.group({
      budget_entity: [workplace?.budget_entity || '', [Validators.required]],
      name: [workplace?.name || '', [Validators.required]],
      parent: [workplace?.parent || null as Workplace | null]
    });

    this.filteredWorkplaces$ = this.workplaceForm.get('parent')!.valueChanges.pipe(
      startWith(this.workplaceForm.get('parent')?.value || ''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this.filterWorkplaces(name) : this.allWorkplaces.slice(0, 10);
      })
    );
  }

  private loadWorkplaces(): void {
    this.isLoadingWorkplaces.set(true);
    this.workplaceService.getWorkplaces()
      .pipe(
        finalize(() => this.isLoadingWorkplaces.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (workplaces) => {
          // Remove o próprio registro atual para não permitir auto-vinculação como pai
          this.allWorkplaces = (workplaces || []).filter(item => item.id !== this.data?.workplace?.id);
          this.workplaceForm.get('parent')?.updateValueAndValidity();
        },
        error: () => {
          this.allWorkplaces = [];
        }
      });
  }

  private filterWorkplaces(name: string): Workplace[] {
    const filterValue = name.toLowerCase();
    return this.allWorkplaces
      .filter(option =>
        (option.name?.toLowerCase().includes(filterValue) ?? false) ||
        (option.budget_entity?.toLowerCase().includes(filterValue) ?? false)
      )
      .slice(0, 10);
  }
}